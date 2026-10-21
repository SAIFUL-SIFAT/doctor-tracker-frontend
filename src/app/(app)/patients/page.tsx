"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Stethoscope,
  Building2,
  Calendar,
  Phone,
  Mail,
  Activity,
  HeartPulse,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Patient, CONDITIONS, PATIENT_STATUSES, Doctor } from "@/types";
import { usePatients, useDeletePatient } from "@/hooks/use-patients";
import { useDoctors } from "@/hooks/use-doctors";
import { DataTable } from "@/components/ui/data-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditPatientSheet } from "@/components/patients/edit-patient-sheet";
import { toast } from "sonner";

function PatientsContent() {
  // nuqs URL query state for shareable, bookmarkable, and refresh-safe URLs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(20));
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [conditions, setConditions] = useQueryState(
    "condition",
    parseAsArrayOf(parseAsString, ",").withDefault([])
  );
  const [status, setStatus] = useQueryState("status", parseAsString.withDefault(""));
  const [doctorId, setDoctorId] = useQueryState("doctorId", parseAsString.withDefault(""));
  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("-createdAt"));

  // Sheets and Dialogs state
  const [patientToEdit, setPatientToEdit] = React.useState<Patient | null>(null);
  const [editSheetOpen, setEditSheetOpen] = React.useState(false);
  const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);

  // Fetch doctors for doctor filter options
  const { data: doctorsData } = useDoctors({ limit: 100 });
  const doctorOptions = React.useMemo(() => {
    return (doctorsData?.data || []).map((doc) => ({
      label: `Dr. ${doc.name} (${doc.specialization})`,
      value: doc._id,
    }));
  }, [doctorsData]);

  // Fetch patients list
  const {
    data: patientsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePatients({
    page,
    limit,
    q: q || undefined,
    condition: conditions.length > 0 ? conditions : undefined,
    status: status || undefined,
    doctorId: doctorId || undefined,
    from: from || undefined,
    to: to || undefined,
    sort: sort || undefined,
  });

  const { mutateAsync: deletePatient, isPending: isDeleting } = useDeletePatient();

  const patients = patientsResponse?.data || [];
  const pagination = patientsResponse?.meta;

  // Build filter configs for FilterBar
  const filterConfigs: FilterConfig[] = React.useMemo(() => {
    const list: FilterConfig[] = [
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
    ];

    if (doctorOptions.length > 0) {
      list.push({
        id: "doctorId",
        label: "Assigned Doctor",
        multi: false,
        options: doctorOptions,
      });
    }

    return list;
  }, [doctorOptions]);

  const activeFilterCount =
    conditions.length +
    (status ? 1 : 0) +
    (doctorId ? 1 : 0) +
    (from || to ? 1 : 0) +
    (q ? 1 : 0);

  const handleFilterChange = (id: string, value: string[] | string | undefined) => {
    setPage(1);
    if (id === "condition") {
      setConditions(Array.isArray(value) ? value : value ? [value] : []);
    } else if (id === "status") {
      setStatus(typeof value === "string" ? value : "");
    } else if (id === "doctorId") {
      setDoctorId(typeof value === "string" ? value : "");
    }
  };

  const handleClearAll = () => {
    setPage(1);
    setQ("");
    setConditions([]);
    setStatus("");
    setDoctorId("");
    setFrom("");
    setTo("");
  };

  const handleSortToggle = (field: string) => {
    setPage(1);
    if (sort === field) {
      setSort(`-${field}`);
    } else if (sort === `-${field}`) {
      setSort("createdAt");
    } else {
      setSort(field);
    }
  };

  const renderSortIcon = (field: string) => {
    if (sort === field) {
      return <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-teal-600" />;
    }
    if (sort === `-${field}`) {
      return <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-teal-600" />;
    }
    return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />;
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case "Heart Disease":
      case "Hypertension":
        return "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900";
      case "Diabetes":
      case "Thyroid Disorder":
        return "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900";
      case "Asthma":
      case "Pulmonology":
        return "bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-900";
      default:
        return "bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900";
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "follow_up":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Follow-up
          </span>
        );
      case "discharged":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Discharged
          </span>
        );
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  const columns: ColumnDef<Patient>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <button
            onClick={() => handleSortToggle("name")}
            className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider group hover:text-teal-600 transition-colors"
          >
            <span>Patient</span>
            {renderSortIcon("name")}
          </button>
        ),
        cell: ({ row }) => {
          const patient = row.original;
          return (
            <div className="flex flex-col min-w-0 py-0.5">
              <div className="font-semibold text-sm text-[var(--ink)] tracking-tight">
                {patient.name}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>
                  {patient.age} yrs • {patient.gender}
                </span>
                {patient.phone && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{patient.phone}</span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "condition",
        header: () => (
          <button
            onClick={() => handleSortToggle("condition")}
            className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider group hover:text-teal-600 transition-colors"
          >
            <span>Condition</span>
            {renderSortIcon("condition")}
          </button>
        ),
        cell: ({ row }) => {
          const cond = row.original.condition;
          return (
            <Badge
              variant="outline"
              className={`text-xs font-medium border ${getConditionColor(cond)}`}
            >
              {cond}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: () => (
          <button
            onClick={() => handleSortToggle("status")}
            className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider group hover:text-teal-600 transition-colors"
          >
            <span>Status</span>
            {renderSortIcon("status")}
          </button>
        ),
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "doctorId",
        header: () => (
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Assigned Doctor
          </span>
        ),
        cell: ({ row }) => {
          const doc = row.original.doctorId as Doctor | undefined;
          if (!doc || typeof doc !== "object" || !doc._id) {
            return <span className="text-xs text-slate-400">Unassigned</span>;
          }

          return (
            <Link
              href={`/doctors/${doc._id}`}
              className="inline-flex flex-col group/doc hover:text-teal-600 transition-colors"
              title={`View Dr. ${doc.name}'s profile`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink)] group-hover/doc:text-teal-600">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="underline decoration-dotted underline-offset-2">
                  Dr. {doc.name}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 pl-5">
                {doc.specialization}
              </span>
            </Link>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <button
            onClick={() => handleSortToggle("createdAt")}
            className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider group hover:text-teal-600 transition-colors"
          >
            <span>Registered</span>
            {renderSortIcon("createdAt")}
          </button>
        ),
        cell: ({ row }) => {
          const dateStr = row.original.createdAt;
          if (!dateStr) return <span className="text-xs text-slate-400">—</span>;
          const d = new Date(dateStr);
          return (
            <div className="flex flex-col text-xs text-slate-600 dark:text-slate-300">
              <span className="font-mono">{format(d, "MMM d, yyyy")}</span>
              <span className="text-[11px] text-slate-400">
                {formatDistanceToNow(d, { addSuffix: true })}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const patient = row.original;
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-[var(--ink)]"
                    />
                  }
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => {
                      setPatientToEdit(patient);
                      setEditSheetOpen(true);
                    }}
                    className="gap-2 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-slate-500" />
                    <span>Edit Patient</span>
                  </DropdownMenuItem>

                  {patient.doctorId &&
                    typeof patient.doctorId === "object" &&
                    (patient.doctorId as Doctor)._id && (
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/doctors/${(patient.doctorId as Doctor)._id}`}
                            className="gap-2 flex items-center w-full"
                          />
                        }
                      >
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                        <span>View Doctor</span>
                      </DropdownMenuItem>
                    )}

                  <DropdownMenuItem
                    onClick={() => setPatientToDelete(patient)}
                    className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Patient</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [sort]
  );

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    try {
      await deletePatient(patientToDelete._id);
      toast.success("Patient deleted successfully", {
        description: `${patientToDelete.name} was removed from the registry.`,
      });
      setPatientToDelete(null);
    } catch (err: unknown) {
      toast.error("Failed to delete patient");
    }
  };

  const renderMobileCard = (p: Patient) => {
    const doc = p.doctorId as Doctor | undefined;
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-sm text-[var(--ink)]">{p.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">
              {p.age} yrs • {p.gender}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {getStatusBadge(p.status)}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500"
              onClick={() => {
                setPatientToEdit(p);
                setEditSheetOpen(true);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--line)] text-xs text-slate-600 dark:text-slate-300">
          <Badge
            variant="outline"
            className={`text-xs font-medium border ${getConditionColor(p.condition)}`}
          >
            {p.condition}
          </Badge>
          {doc && typeof doc === "object" && doc._id && (
            <Link
              href={`/doctors/${doc._id}`}
              className="flex items-center gap-1 text-teal-600 hover:underline"
            >
              <Stethoscope className="w-3 h-3" />
              <span>Dr. {doc.name}</span>
            </Link>
          )}
          {p.phone && (
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <Phone className="w-3 h-3" />
              {p.phone}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[var(--ink)]">
              Patients
            </h1>
            <Badge
              variant="secondary"
              className="font-mono text-xs font-semibold px-2.5 py-0.5"
            >
              {pagination?.total ?? 0}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage all registered patients across all ward doctors.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchPlaceholder="Search patients by name, phone, or email..."
        searchValue={q}
        onSearchChange={(val) => {
          setPage(1);
          setQ(val);
        }}
        filters={filterConfigs}
        selectedFilters={{
          condition: conditions,
          status: status || undefined,
          doctorId: doctorId || undefined,
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

      {/* TanStack DataTable */}
      <DataTable
        columns={columns}
        data={patients}
        pagination={pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error as Error | null}
        onRetry={refetch}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setLimit(sz);
          setPage(1);
        }}
        renderMobileCard={renderMobileCard}
        emptyTitle={
          activeFilterCount > 0 ? "No matching patients" : "No patients found"
        }
        emptyDescription={
          activeFilterCount > 0
            ? "Try loosening your search terms or clearing some active filters."
            : "No patients have been registered in the database yet."
        }
        emptyAction={
          activeFilterCount > 0 ? (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              Reset all filters
            </Button>
          ) : undefined
        }
      />

      {/* Edit Patient Sheet */}
      <EditPatientSheet
        patient={patientToEdit}
        open={editSheetOpen}
        onOpenChange={(open) => {
          setEditSheetOpen(open);
          if (!open) setPatientToEdit(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!patientToDelete}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
        title="Delete Patient Record"
        description={
          patientToDelete
            ? `Are you sure you want to delete ${patientToDelete.name}? This will remove the patient record and update the doctor's active patient count immediately.`
            : "Are you sure you want to proceed?"
        }
        confirmText="Delete Patient"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      }
    >
      <PatientsContent />
    </React.Suspense>
  );
}
