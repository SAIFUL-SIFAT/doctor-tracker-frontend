"use client";

import React, { useEffect, useState } from "react";
import { Award, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export interface SpecializationCount {
  specialization: string;
  count: number;
}

interface SpecializationsBreakdownProps {
  data?: SpecializationCount[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function SpecializationsBreakdown({
  data = [],
  isLoading,
  error,
  onRetry,
}: SpecializationsBreakdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full flex flex-col justify-between">
        <div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-60 mt-1" />
        </div>
        <div className="space-y-3 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-200 bg-rose-50/40 h-full flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
        <h4 className="font-semibold text-rose-900 text-sm">Failed to load specialization mix</h4>
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

  const totalDoctors = data.reduce((acc, curr) => acc + curr.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
        <div>
          <h3 className="font-heading font-semibold text-base text-[var(--ink)] flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--teal)]" />
            Doctors by Specialization
          </h3>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">
            Distribution across clinical departments
          </p>
        </div>
        <span className="text-xs font-mono text-[var(--muted-text)]">
          {totalDoctors.toLocaleString()} doctors
        </span>
      </div>

      <div className="space-y-3.5 pt-4 flex-1 overflow-y-auto pr-1">
        {data.map((item) => {
          const percentage = totalDoctors > 0 ? ((item.count / totalDoctors) * 100).toFixed(1) : "0";
          const barWidth = (item.count / maxCount) * 100;

          return (
            <Link
              key={item.specialization}
              href={`/doctors?specialization=${encodeURIComponent(item.specialization)}`}
              className="group block hover:bg-[var(--teal-soft)]/20 p-1.5 -mx-1.5 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-[var(--ink)] group-hover:text-[var(--teal)]">
                  {item.specialization}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[var(--muted-text)] font-mono">
                    {percentage}%
                  </span>
                  <span className="font-mono font-semibold text-[var(--ink)] tabular-nums">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-full bg-[var(--canvas)] h-2 rounded-full overflow-hidden border border-[var(--line)]/50">
                <div
                  className="h-full bg-slate-700/80 rounded-full transition-all duration-600 ease-out group-hover:bg-[var(--teal)]"
                  style={{
                    width: mounted ? `${Math.max(barWidth, 2)}%` : "0%",
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
