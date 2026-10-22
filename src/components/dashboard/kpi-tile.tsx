"use client";

import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./animated-number";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiTileProps {
  title: string;
  value?: number;
  decimals?: number;
  icon?: LucideIcon;
  delta?: {
    value: number;
    percentage: number;
    periodLabel: string;
  };
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function KpiTile({
  title,
  value,
  decimals = 0,
  icon: Icon,
  delta,
  isLoading,
  error,
  onRetry,
}: KpiTileProps) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] flex flex-col justify-between min-h-[130px]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
        <div className="space-y-2 mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3.5 w-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between min-h-[130px]">
        <div className="text-xs font-medium text-rose-800">{title}</div>
        <div className="py-2">
          <p className="text-xs text-rose-600 line-clamp-1">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-semibold text-rose-700 hover:underline text-left self-start"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const isPositive = (delta?.percentage ?? 0) >= 0;

  return (
    <div className="p-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--teal)]/40 transition-colors flex flex-col justify-between min-h-[130px] group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-text)]">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[var(--canvas)] border border-[var(--line)] flex items-center justify-center text-[var(--teal)] group-hover:bg-[var(--teal-soft)] transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-3xl font-bold tracking-tight text-[var(--ink)] font-heading">
          {typeof value === "number" ? (
            <AnimatedNumber value={value} decimals={decimals} />
          ) : (
            "—"
          )}
        </div>

        {delta ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={`inline-flex items-center font-medium ${
                isPositive ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              )}
              {isPositive ? "+" : ""}
              {delta.percentage}%
            </span>
            <span className="text-[var(--muted-text)]">{delta.periodLabel}</span>
          </div>
        ) : (
          <div className="mt-2 text-xs text-[var(--muted-text)]">
            Total active roster count
          </div>
        )}
      </div>
    </div>
  );
}
