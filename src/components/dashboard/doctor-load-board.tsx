"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Stethoscope, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface DoctorLoadItem {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  patientCount: number;
}

interface DoctorLoadBoardProps {
  doctors?: DoctorLoadItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function DoctorLoadBoard({
  doctors = [],
  isLoading,
  error,
  onRetry,
}: DoctorLoadBoardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-48 mt-1" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="divide-y divide-[var(--line)]/50 flex-1 flex flex-col justify-around py-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between gap-4">
              <div className="w-1/3 space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3.5 flex-1 rounded-full" />
              <Skeleton className="h-4 w-8" />
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
        <h4 className="font-semibold text-rose-900 text-sm">Failed to load Doctor Load Board</h4>
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

  if (!doctors.length) {
    return (
      <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full flex flex-col items-center justify-center text-center">
        <Stethoscope className="w-8 h-8 text-[var(--muted-text)] mb-2 opacity-50" />
        <p className="text-sm font-medium text-[var(--ink)]">No doctors on roster yet</p>
        <p className="text-xs text-[var(--muted-text)] mt-1">
          Add doctors to track patient load distribution.
        </p>
        <Link
          href="/doctors"
          className="mt-3 text-xs font-semibold text-[var(--teal)] hover:underline inline-flex items-center gap-1"
        >
          Go to Doctors Directory &rarr;
        </Link>
      </div>
    );
  }

  const maxCount = Math.max(...doctors.map((d) => d.patientCount), 1);

  return (
    <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
        <div>
          <h3 className="font-heading font-semibold text-base text-[var(--ink)] flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[var(--teal)]" />
            Doctor Load Board
          </h3>
          <p className="text-xs text-[var(--muted-text)] mt-0.5">
            Ranked workload distribution (top {doctors.length} doctors)
          </p>
        </div>
        <Link
          href="/doctors?sort=-patientCount"
          className="text-xs font-medium text-[var(--teal)] hover:underline inline-flex items-center gap-0.5"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-[var(--line)]/40 flex-1 overflow-y-auto mt-1 pr-1">
        {doctors.map((doctor, index) => {
          const ratio = doctor.patientCount / maxCount;
          const percentage = Math.round(ratio * 100);
          const isHeavy = ratio >= 0.85;

          return (
            <Link
              key={doctor.id}
              href={`/doctors/${doctor.id}`}
              className="py-3 flex items-center justify-between gap-4 hover:bg-[var(--teal-soft)]/25 px-2 -mx-2 rounded-lg transition-colors group"
            >
              <div className="min-w-0 w-36 sm:w-44 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-[var(--muted-text)] w-4 shrink-0">
                    {index + 1}.
                  </span>
                  <span className="text-xs font-semibold text-[var(--ink)] truncate group-hover:text-[var(--teal)]">
                    {doctor.name}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--muted-text)] truncate pl-5">
                  {doctor.specialization} · {doctor.hospital}
                </div>
              </div>

              {/* Load Bar */}
              <div className="flex-1 max-w-xs sm:max-w-md mx-2">
                <div className="w-full bg-[var(--canvas)] h-3 rounded-full overflow-hidden border border-[var(--line)]/60">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isHeavy
                        ? "bg-[var(--teal)]"
                        : "bg-[var(--teal)]/45"
                    }`}
                    style={{
                      width: mounted ? `${Math.max(percentage, 3)}%` : "0%",
                    }}
                  />
                </div>
              </div>

              {/* Count */}
              <div className="text-right shrink-0 min-w-12">
                <span className="font-mono text-xs font-semibold tabular-nums text-[var(--ink)]">
                  {doctor.patientCount}
                </span>
                <span className="text-[10px] text-[var(--muted-text)] block">
                  pts
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
