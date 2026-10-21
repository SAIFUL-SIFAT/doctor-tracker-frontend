"use client";

import { useAuth } from "@/lib/auth-context";
import { Activity, Stethoscope, Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] font-heading">
            Ward Overview
          </h1>
          <p className="text-sm text-[var(--muted-text)] mt-1">
            Welcome back, {user?.name || "Administrator"}. Here is your clinical snapshot.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/doctors">
            <Button className="bg-[var(--teal)] hover:bg-[#096662] text-white">
              <Stethoscope className="w-4 h-4 mr-2" />
              Manage Doctors
            </Button>
          </Link>
          <Link href="/patients">
            <Button variant="outline" className="border-[var(--line)]">
              <Users className="w-4 h-4 mr-2 text-[var(--teal)]" />
              Manage Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick link cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--surface)] border border-[var(--line)] rounded-xl space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[var(--teal-soft)] flex items-center justify-center text-[var(--teal)]">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[var(--ink)]">
            Doctors Directory
          </h3>
          <p className="text-xs text-[var(--muted-text)]">
            View clinical staff, assigned patient loads, contact directories, and hospital affiliations.
          </p>
          <div className="pt-2">
            <Link
              href="/doctors"
              className="text-xs font-medium text-[var(--teal)] hover:underline inline-flex items-center"
            >
              Open Doctors &rarr;
            </Link>
          </div>
        </div>

        <div className="p-6 bg-[var(--surface)] border border-[var(--line)] rounded-xl space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[var(--teal-soft)] flex items-center justify-center text-[var(--teal)]">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[var(--ink)]">
            Patients Registry
          </h3>
          <p className="text-xs text-[var(--muted-text)]">
            Track admission records, active conditions, assigned attending physicians, and follow-ups.
          </p>
          <div className="pt-2">
            <Link
              href="/patients"
              className="text-xs font-medium text-[var(--teal)] hover:underline inline-flex items-center"
            >
              Open Patients &rarr;
            </Link>
          </div>
        </div>

        <div className="p-6 bg-[var(--surface)] border border-[var(--line)] rounded-xl space-y-2">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[var(--teal)]">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-semibold text-base text-[var(--ink)]">
            Full Analytics
          </h3>
          <p className="text-xs text-[var(--muted-text)]">
            Block 7 will bring the full Doctor Load Board, registration charts, and condition breakdown.
          </p>
          <div className="pt-2">
            <span className="text-xs font-semibold text-[var(--teal)]">
              Scheduled for Day 2 Block 7
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
