"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import {
  Users,
  Stethoscope,
  UserPlus,
  Scale,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { DoctorLoadBoard } from "@/components/dashboard/doctor-load-board";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Dynamic imports with ssr: false for charts
const RegistrationsChart = dynamic(
  () =>
    import("@/components/dashboard/registrations-chart").then(
      (mod) => mod.RegistrationsChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full min-h-[320px] flex flex-col justify-between">
        <div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-64 mt-1" />
        </div>
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
    ),
  }
);

const ConditionsBreakdown = dynamic(
  () =>
    import("@/components/dashboard/conditions-breakdown").then(
      (mod) => mod.ConditionsBreakdown
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full min-h-[280px] flex flex-col justify-between">
        <div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56 mt-1" />
        </div>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    ),
  }
);

const SpecializationsBreakdown = dynamic(
  () =>
    import("@/components/dashboard/specializations-breakdown").then(
      (mod) => mod.SpecializationsBreakdown
    ),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 rounded-xl border border-[var(--line)] bg-[var(--surface)] h-full min-h-[280px] flex flex-col justify-between">
        <div>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-60 mt-1" />
        </div>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    ),
  }
);

const RANGES = ["7d", "30d", "90d"] as const;
type RangeType = (typeof RANGES)[number];

function DashboardContent() {
  const { user } = useAuth();

  // URL state for range selector
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(RANGES).withDefault("30d")
  );

  const rangeDays = range === "7d" ? 7 : range === "90d" ? 90 : 30;

  // 1. Summary Query
  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary", range],
    queryFn: async () => {
      const res = await apiClient<{
        data: {
          totalDoctors: number;
          totalPatients: number;
          avgPatientsPerDoctor: number;
          currentPeriodPatients: number;
          previousPeriodPatients: number;
          deltaPatients: number;
          deltaPercentage: number;
          rangeDays: number;
        };
      }>(`/api/v1/dashboard/summary?range=${range}`);
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 2. Doctor Load Board Query
  const doctorLoadQuery = useQuery({
    queryKey: ["dashboard", "patients-per-doctor"],
    queryFn: async () => {
      const res = await apiClient<{
        data: Array<{
          id: string;
          name: string;
          specialization: string;
          hospital: string;
          patientCount: number;
        }>;
      }>("/api/v1/dashboard/patients-per-doctor?limit=10");
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 3. Registrations Query
  const registrationsQuery = useQuery({
    queryKey: ["dashboard", "registrations", range],
    queryFn: async () => {
      const res = await apiClient<{
        data: Array<{
          date: string;
          count: number;
        }>;
      }>(`/api/v1/dashboard/registrations?range=${range}`);
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 4. Conditions Query
  const conditionsQuery = useQuery({
    queryKey: ["dashboard", "conditions"],
    queryFn: async () => {
      const res = await apiClient<{
        data: Array<{
          condition: string;
          count: number;
        }>;
      }>("/api/v1/dashboard/conditions");
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  // 5. Specializations Query
  const specializationsQuery = useQuery({
    queryKey: ["dashboard", "specializations"],
    queryFn: async () => {
      const res = await apiClient<{
        data: Array<{
          specialization: string;
          count: number;
        }>;
      }>("/api/v1/dashboard/specializations");
      return res.data;
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] font-heading flex items-center gap-2">
            Clinical Overview
            <span className="text-xs px-2 py-0.5 rounded-full font-sans font-medium bg-[var(--teal-soft)] text-[var(--teal)] border border-[var(--teal)]/20">
              Live Feed
            </span>
          </h1>
          <p className="text-sm text-[var(--muted-text)] mt-1">
            Welcome back, {user?.name || "Administrator"}. Here is your patient load and registration trends.
          </p>
        </div>

        {/* Range Pill Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[var(--surface)] p-1 rounded-xl border border-[var(--line)] shadow-xs">
          <Calendar className="w-3.5 h-3.5 ml-2 text-[var(--muted-text)]" />
          <span className="text-xs font-medium text-[var(--muted-text)] pr-1 hidden sm:inline">
            Period:
          </span>
          <div className="flex items-center gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  range === r
                    ? "bg-[var(--teal)] text-white shadow-xs"
                    : "text-[var(--muted-text)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Tiles (Headline Numbers - S1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          title="Total Doctors"
          value={summaryQuery.data?.totalDoctors}
          icon={Stethoscope}
          isLoading={summaryQuery.isLoading}
          error={summaryQuery.error ? (summaryQuery.error as ApiError).message : null}
          onRetry={() => summaryQuery.refetch()}
        />

        <KpiTile
          title="Total Patients"
          value={summaryQuery.data?.totalPatients}
          icon={Users}
          isLoading={summaryQuery.isLoading}
          error={summaryQuery.error ? (summaryQuery.error as ApiError).message : null}
          onRetry={() => summaryQuery.refetch()}
        />

        <KpiTile
          title="Avg Per Doctor"
          value={summaryQuery.data?.avgPatientsPerDoctor}
          decimals={1}
          icon={Scale}
          isLoading={summaryQuery.isLoading}
          error={summaryQuery.error ? (summaryQuery.error as ApiError).message : null}
          onRetry={() => summaryQuery.refetch()}
        />

        <KpiTile
          title={`New Patients (${range})`}
          value={summaryQuery.data?.currentPeriodPatients}
          icon={UserPlus}
          delta={
            summaryQuery.data
              ? {
                  value: summaryQuery.data.deltaPatients,
                  percentage: summaryQuery.data.deltaPercentage,
                  periodLabel: `vs previous ${range}`,
                }
              : undefined
          }
          isLoading={summaryQuery.isLoading}
          error={summaryQuery.error ? (summaryQuery.error as ApiError).message : null}
          onRetry={() => summaryQuery.refetch()}
        />
      </div>

      {/* Main Charts Row: Registrations (S3) & Doctor Load Board (S2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 min-h-[360px]">
          <RegistrationsChart
            data={registrationsQuery.data}
            rangeDays={rangeDays}
            isLoading={registrationsQuery.isLoading}
            error={
              registrationsQuery.error
                ? (registrationsQuery.error as ApiError).message
                : null
            }
            onRetry={() => registrationsQuery.refetch()}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 min-h-[360px]">
          <DoctorLoadBoard
            doctors={doctorLoadQuery.data}
            isLoading={doctorLoadQuery.isLoading}
            error={
              doctorLoadQuery.error
                ? (doctorLoadQuery.error as ApiError).message
                : null
            }
            onRetry={() => doctorLoadQuery.refetch()}
          />
        </div>
      </div>

      {/* Secondary Row: Conditions (S4) & Specializations (S5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="min-h-[320px]">
          <ConditionsBreakdown
            data={conditionsQuery.data}
            isLoading={conditionsQuery.isLoading}
            error={
              conditionsQuery.error
                ? (conditionsQuery.error as ApiError).message
                : null
            }
            onRetry={() => conditionsQuery.refetch()}
          />
        </div>

        <div className="min-h-[320px]">
          <SpecializationsBreakdown
            data={specializationsQuery.data}
            isLoading={specializationsQuery.isLoading}
            error={
              specializationsQuery.error
                ? (specializationsQuery.error as ApiError).message
                : null
            }
            onRetry={() => specializationsQuery.refetch()}
          />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Skeleton className="lg:col-span-8 h-80 rounded-xl" />
            <Skeleton className="lg:col-span-4 h-80 rounded-xl" />
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
