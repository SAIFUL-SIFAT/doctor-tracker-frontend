"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Calendar,
  Users,
  Plus,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Activity,
  AlertCircle,
  FileText,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Patient, CONDITIONS, PATIENT_STATUSES } from "@/types";
import {
  useDoctor,
  useDoctorPatients,
  useRemoveDoctorPatient,
} from "@/hooks/use-doctors";
import { DataTable } from "@/components/ui/data-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddPatientSheet } from "@/components/patients/add-patient-sheet";
import { toast } from "sonner";

function DoctorDetailContent() {
  const params = useParams();
  const doctorId = String(params.id);

  // URL state for doctor patients
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [conditions, setConditions] = useQueryState(
    "condition",
    parseAsArrayOf(parseAsString, ",").withDefault([])
  );
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("-createdAt"));

  // Sheets and Dialogs state
  const [addPatientOpen, setAddPatientOpen] = React.useState(false);
  const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);

  // Fetch doctor profile
  const {
    data: doctorData,
    isLoading: doctorLoading,
    isError: doctorError,
    error: doctorErr,
  } = useDoctor(doctorId);

  // Fetch doctor patients
  const {
    data: patientsData,
    isLoading: patientsLoading,
    isFetching: patientsFetching,
    isError: patientsError,
    error: patientsErr,
    refetch: refetchPatients,
  } = useDoctorPatients(doctorId, {
    page,
    limit,
    q: q || undefined,
    condition: conditions.length > 0 ? conditions : undefined,
    status: status || undefined,
    from: from || undefined,
    to: to || undefined,
    sort: sort || undefined,
  });

  const { mutateAsync: removePatient, isPending: isRemoving } = useRemoveDoctorPatient(doctorId);

  const doctor = doctorData?.data;
  const patients = patientsData?.data || [];
  const pagination = patientsData?.meta;

  // Filter bar config
  const filterConfigs: FilterConfig[] = React.useMemo(() => [
    {
      id: "condition",
      label: "Condition",
      multi: true,
      options: CONDITIONS.map((c) => ({ label: c, value: c })),
    },
    {
      id: "status",
      label: "Status",
      multi: false,
      options: PATIENT_STATUSES.map((s) => ({
        label: s === "follow_up" ? "Follow-up" : s.charAt(0).toUpperCase() + s.slice(1),
        value: s,
      })),
    },
  ], []);

  const activeFilterCount =
    conditions.length +
    (status ? 1 : 0) +
    (from || to ? 1 : 0) +
    (q ? 1 : 0);

  const handleFilterChange = (id: string, value: string[] | string | undefined) => {
    setPage(1);
    if (id === "condition") {
      setConditions(Array.isArray(value) ? value : value ? [value] : []);
    } else if (id === "status") {
      setStatus((value as string) || "");
    }
  };

  const handleClearAll = () => {
    setPage(1);
    setQ("");
    setConditions([]);
    setStatus("");
    setFrom("");
    setTo("");
  };

  // Sort helpers
  const handleSortToggle = (field: string) => {
    setPage(1);
    if (sort === field) {
      setSort(`-${field}`);
    } else if (sort === `-${field}`) {
      setSort("-createdAt");
    } else {
      setSort(field);
    }
  };

  const getSortIcon = (field: string) => {
    if (sort === field) return <ArrowUp className="w-3.5 h-3.5 ml-1 text-[var(--teal)]" />;
    if (sort === `-${field}`) return <ArrowDown className="w-3.5 h-3.5 ml-1 text-[var(--teal)]" />;
    return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400 opacity-60" />;
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    try {
      await removePatient(patientToDelete._id);
      toast.success("Patient removed", {
        description: `${patientToDelete.name} has been removed from Dr. ${doctor?.name || "the doctor"}.`,
      });
      setPatientToDelete(null);
    } catch {
      toast.error("Failed to remove patient. Please try again.");
    }
  };

  // Status badge helper: dot + text per DESIGN.md §5.7
  const renderStatusBadge = (stat: string) => {
    if (stat === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    }
    if (stat === "follow_up") {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Follow-up
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Discharged
      </span>
    );
  };

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "name",
      header: () => (
        <button
          type="button"
          onClick={() => handleSortToggle("name")}
          className="flex items-center text-xs font-semibold hover:text-[var(--ink)] focus:outline-none"
        >
          Patient
          {getSortIcon("name")}
        </button>
      ),
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-heading font-medium text-sm text-[var(--ink)]">
              {p.name}
            </span>
            <span className="text-xs text-[var(--muted-text)] font-mono">
              {p.phone}
            </span>
          </div>
        );
      },
    },
    {
      id: "ageGender",
      header: "Age / Gender",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <span className="text-xs text-[var(--ink)] capitalize">
            {p.age} yrs · {p.gender}
          </span>
        );
      },
    },
    {
      accessorKey: "condition",
      header: "Condition",
      cell: ({ row }) => {
        return (
          <span className="text-xs text-[var(--ink)] font-normal">
            {row.original.condition}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => renderStatusBadge(row.original.status),
    },
    {
      accessorKey: "createdAt",
      meta: {
        className: "hidden lg:table-cell",
      },
      header: () => (
        <button
          type="button"
          onClick={() => handleSortToggle("createdAt")}
          className="flex items-center text-xs font-semibold hover:text-[var(--ink)] focus:outline-none"
        >
          Registered
          {getSortIcon("createdAt")}
        </button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-xs text-[var(--muted-text)]" title={format(date, "PPpp")}>
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPatientToDelete(p)}
              title="Delete patient"
              className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  const renderMobileCard = (p: Patient) => (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-heading font-medium text-sm text-[var(--ink)]">
            {p.name}
          </div>
          <div className="text-xs text-[var(--muted-text)] font-mono">
            {p.phone}
          </div>
        </div>
        <div>{renderStatusBadge(p.status)}</div>
      </div>

      <div className="flex items-center gap-3 text-xs text-[var(--muted-text)] pt-1">
        <span>Age: <strong className="text-[var(--ink)] font-normal">{p.age}</strong></span>
        <span>•</span>
        <span className="capitalize">{p.gender}</span>
        <span>•</span>
        <span className="text-[var(--ink)]">{p.condition}</span>
      </div>

      {p.notes && (
        <div className="text-xs text-[var(--muted-text)] italic bg-[var(--canvas)] p-2 rounded">
          &ldquo;{p.notes}&rdquo;
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/60 text-xs">
        <span className="text-[var(--muted-text)]">
          {format(new Date(p.createdAt), "MMM d, yyyy")}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPatientToDelete(p)}
          className="h-7 text-xs border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Remove
        </Button>
      </div>
    </div>
  );

  if (doctorError) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-lg font-semibold text-[var(--ink)]">
          Doctor not found
        </h2>
        <p className="text-xs text-[var(--muted-text)]">
          {(doctorErr as Error)?.message || "The requested doctor profile could not be retrieved."}
        </p>
        <Link href="/doctors">
          <Button variant="outline" size="sm" className="text-xs border-[var(--line)]">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Doctors
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1 text-xs text-[var(--muted-text)] hover:text-[var(--ink)] font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Doctors directory</span>
        </Link>
      </div>

      {/* Doctor Header Profile Card */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs">
        {doctorLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-7 w-64 bg-slate-100" />
            <Skeleton className="h-4 w-48 bg-slate-50" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--line)]">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : doctor ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-2xl font-semibold text-[var(--ink)] tracking-tight">
                    {doctor.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className="border-teal-200 bg-[var(--teal-soft)]/50 text-[var(--teal)] font-medium text-xs"
                  >
                    {doctor.specialization}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-text)] mt-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doctor.hospital}</span>
                </div>
              </div>

              {/* Action */}
              <Button
                onClick={() => setAddPatientOpen(true)}
                className="bg-[var(--teal)] hover:bg-teal-700 text-white text-xs h-9 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add patient
              </Button>
            </div>

            {/* Quick Meta Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--line)] text-xs">
              <div className="space-y-1">
                <div className="text-[var(--muted-text)] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone</span>
                </div>
                <div className="font-mono font-medium text-[var(--ink)]">
                  {doctor.phone}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[var(--muted-text)] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email</span>
                </div>
                <div className="font-medium text-[var(--ink)] truncate" title={doctor.email}>
                  {doctor.email}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[var(--muted-text)] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>Assigned Patients</span>
                </div>
                <div className="font-heading text-base font-semibold text-[var(--teal)]">
                  {doctor.patientCount || 0}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[var(--muted-text)] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined Date</span>
                </div>
                <div className="text-[var(--ink)]">
                  {format(new Date(doctor.createdAt), "dd MMM yyyy")}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Doctor's Patients Section */}
      <div id="patients" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-semibold text-[var(--ink)] tracking-tight">
              Patient Roster ({pagination?.total ?? (doctor?.patientCount || 0)})
            </h2>
            <p className="text-xs text-[var(--muted-text)]">
              All patients currently assigned under Dr. {doctor?.name || "this doctor"}.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="Search patients by name, phone..."
          searchValue={q}
          onSearchChange={(val) => {
            setPage(1);
            setQ(val);
          }}
          filters={filterConfigs}
          selectedFilters={{
            condition: conditions,
            status: status || undefined,
          }}
          onFilterChange={handleFilterChange}
          dateRange={{ from: from || undefined, to: to || undefined }}
          onDateRangeChange={(f, t) => {
            setPage(1);
            setFrom(f || "");
            setTo(t || "");
          }}
          onClearAll={handleClearAll}
          activeFilterCount={activeFilterCount}
          totalResults={pagination?.total}
          resultsLabel="patients"
        />

        {/* Patients Table */}
        <DataTable
          columns={columns}
          data={patients}
          pagination={pagination}
          isLoading={patientsLoading}
          isFetching={patientsFetching}
          isError={patientsError}
          error={patientsErr as Error}
          onRetry={() => refetchPatients()}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={(s) => {
            setPage(1);
            setLimit(s);
          }}
          renderMobileCard={renderMobileCard}
          emptyTitle={
            activeFilterCount > 0
              ? "No patients match these filters"
              : `${doctor?.name ? `Dr. ${doctor.name}` : "This doctor"} has no patients yet`
          }
          emptyDescription={
            activeFilterCount > 0
              ? "Try adjusting your filters or search term."
              : "Register and assign a new patient under this doctor's care."
          }
          emptyAction={
            activeFilterCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-xs border-[var(--line)] text-[var(--ink)]"
              >
                Clear filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setAddPatientOpen(true)}
                className="text-xs bg-[var(--teal)] text-white hover:bg-teal-700"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add patient
              </Button>
            )
          }
        />
      </div>

      {/* Add Patient Sheet */}
      {doctor && (
        <AddPatientSheet
          doctorId={doctor._id}
          doctorName={doctor.name}
          open={addPatientOpen}
          onOpenChange={setAddPatientOpen}
          onSuccess={() => refetchPatients()}
        />
      )}

      {/* Confirm Delete Patient Dialog */}
      <ConfirmDialog
        open={Boolean(patientToDelete)}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
        title={`Delete ${patientToDelete?.name}?`}
        description={`This removes the patient from ${doctor?.name ? `Dr. ${doctor.name}'s` : "the doctor's"} list and cannot be undone.`}
        confirmText="Delete patient"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={handleDeletePatient}
      />
    </div>
  );
}

export default function DoctorDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-6 space-y-4">
          <div className="h-6 w-32 bg-slate-100 rounded animate-pulse" />
          <div className="h-44 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-64 w-full bg-slate-100 rounded-xl animate-pulse" />
        </div>
      }
    >
      <DoctorDetailContent />
    </React.Suspense>
  );
}

