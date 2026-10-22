"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

export interface RegistrationPoint {
  date: string;
  count: number;
}

interface RegistrationsChartProps {
  data?: RegistrationPoint[];
  rangeDays?: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function RegistrationsChart({
  data = [],
  rangeDays = 30,
  isLoading,
  error,
  onRetry,
}: RegistrationsChartProps) {
  // Compute 7-day moving average
  const chartData = useMemo(() => {
    if (!data.length) return [];

    return data.map((item, index) => {
      // average of window [max(0, index - 6), index]
      const windowStart = Math.max(0, index - 6);
      const windowItems = data.slice(windowStart, index + 1);
      const sum = windowItems.reduce((acc, curr) => acc + curr.count, 0);
      const movingAvg = Number((sum / windowItems.length).toFixed(1));

      return {
        ...item,
        movingAvg,
        formattedDate: (() => {
          try {
            return format(parseISO(item.date), "MMM d");
          } catch {
            return item.date;
          }
        })(),
      };
    });
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full flex flex-col justify-between">
        <div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64 mt-1" />
        </div>
        <div className="h-64 flex items-end gap-2 pt-6">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-200 bg-rose-50/40 h-full flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
        <h4 className="font-semibold text-rose-900 text-sm">Failed to load registration trends</h4>
        <p className="text-xs text-rose-700 mt-1 max-w-sm">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full flex flex-col"
      role="region"
      aria-label="Patient registrations daily trend and 7-day rolling average chart"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-2">
        <div>
          <h3 className="font-heading font-semibold text-base text-[var(--ink)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--teal)]" />
            Patient Registrations
          </h3>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">
            Daily admissions with 7-day rolling average (zero-filled)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[var(--teal)] opacity-80" />
            <span className="text-[var(--muted-text)] font-medium">Daily</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-amber-600 rounded-full" />
            <span className="text-[var(--muted-text)] font-medium">7-Day Avg</span>
          </div>
        </div>
      </div>

      {/* Visually hidden accessible data table fallback per DESIGN.md §8 */}
      <table className="sr-only">
        <caption>Patient registrations data</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Count</th>
            <th scope="col">7-Day Average</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.count}</td>
              <td>{d.movingAvg}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="h-64 sm:h-72 w-full pt-4" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="patientTealArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--teal)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="formattedDate"
              stroke="var(--muted-text)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={rangeDays <= 7 ? 0 : rangeDays <= 30 ? 4 : 12}
            />
            <YAxis
              stroke="var(--muted-text)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              domain={[0, "auto"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const dataPoint = payload[0].payload;
                return (
                  <div className="bg-[var(--surface)] border border-[var(--line)] shadow-lg rounded-lg p-3 text-xs space-y-1">
                    <p className="font-semibold text-[var(--ink)]">
                      {format(parseISO(dataPoint.date), "MMMM d, yyyy")}
                    </p>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[var(--teal)] font-medium">Registrations:</span>
                      <span className="font-mono font-bold text-[var(--ink)]">
                        {dataPoint.count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-amber-700">
                      <span className="font-medium">7-day avg:</span>
                      <span className="font-mono font-semibold">
                        {dataPoint.movingAvg}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--teal)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#patientTealArea)"
            />
            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="#d97706"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
