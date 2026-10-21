"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from "nuqs";
import { ColumnDef } from "@tanstack/react-table";
import {
  Stethoscope,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Building2,
  Calendar,
  Users,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Doctor } from "@/types";
import { useDoctors, useDoctorFilters } from "@/hooks/use-doctors";
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
import { AddDoctorSheet } from "@/components/doctors/add-doctor-sheet";

function DoctorsContent() {
  // nuqs URL query state
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState("limit", parseAsInteger.withDefault(20));
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));
  const [specs, setSpecs] = useQueryState(
    "specialization",
    parseAsArrayOf(parseAsString, ",").withDefault([])
  );
  const [hospital, setHospital] = useQueryState("hospital", parseAsString.withDefault(""));
  const [from, setFrom] = useQueryState("from", parseAsString.withDefault(""));
  const [to, setTo] = useQueryState("to", parseAsString.withDefault(""));
  const [sort, setSort] = useQueryState("sort", parseAsString.withDefault("-createdAt"));

  const [addSheetOpen, setAddSheetOpen] = React.useState(false);

  // Fetch filter metadata from server
  const { data: filtersData } = useDoctorFilters();
  const filterMeta = filtersData?.data;

  // Fetch doctors list
  const {
    data: doctorsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useDoctors({
    page,
    limit,
    q: q || undefined,
    specialization: specs.length > 0 ? specs : undefined,
    hospital: hospital || undefined,
    from: from || undefined,
    to: to || undefined,
    sort: sort || undefined,
  });

  const doctors = doctorsResponse?.data || [];
  const pagination = doctorsResponse?.meta;

  // Compute maximum patient count for proportional load bars
  const maxPatients = React.useMemo(() => {
    if (doctors.length === 0) return 1;
    return Math.max(...doctors.map((d) => d.patientCount || 0), 1);
  }, [doctors]);

  // Construct filters for FilterBar
  const filterConfigs: FilterConfig[] = React.useMemo(() => {
    const list: FilterConfig[] = [];
    if (filterMeta?.specializations) {
      list.push({
        id: "specialization",
        label: "Specialization",
        multi: true,
        options: filterMeta.specializations.map((s) => ({ label: s, value: s })),
      });
    }
    if (filterMeta?.hospitals) {
      list.push({
        id: "hospital",
        label: "Hospital",
        multi: false,
        options: filterMeta.hospitals.map((h) => ({ label: h, value: h })),
      });
    }
    return list;
  }, [filterMeta]);

  // Active filter count
  const activeFilterCount =
    specs.length +
    (hospital ? 1 : 0) +
    (from || to ? 1 : 0) +
    (q ? 1 : 0);

  const handleFilterChange = (id: string, value: string[] | string | undefined) => {
    setPage(1); // reset to page 1 on filter
    if (id === "specialization") {
      setSpecs(Array.isArray(value) ? value : value ? [value] : []);
    } else if (id === "hospital") {
      setHospital((value as string) || "");
    }
  };

  const handleDateRangeChange = (newFrom?: string, newTo?: string) => {
    setPage(1);
    setFrom(newFrom || "");
    setTo(newTo || "");
  };

  const handleClearAll = () => {
    setPage(1);
    setQ("");
    setSpecs([]);
    setHospital("");
    setFrom("");
    setTo("");
  };

  // Sort helper
  const handleSortToggle = (field: string) => {
    setPage(1);
    if (sort === field) {
      setSort(`-${field}`);
    } else if (sort === `-${field}`) {
      setSort("-createdAt"); // reset default
    } else {
      setSort(field);
    }
  };

  const getSortIcon = (field: string) => {
    if (sort === field) return <ArrowUp className="w-3.5 h-3.5 ml-1 text-[var(--teal)]" />;
    if (sort === `-${field}`) return <ArrowDown className="w-3.5 h-3.5 ml-1 text-[var(--teal)]" />;
    return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400 opacity-60" />;
  };

  // TanStack table columns
  const columns: ColumnDef<Doctor>[] = [
    {
      accessorKey: "name",
      header: () => (
        <button
          type="button"
          onClick={() => handleSortToggle("name")}
          className="flex items-center text-xs font-semibold hover:text-[var(--ink)] focus:outline-none"
        >
          Doctor
          {getSortIcon("name")}
        </button>
      ),
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex flex-col">
            <Link
              href={`/doctors/${doc._id}`}
              className="font-heading font-medium text-sm text-[var(--ink)] hover:text-[var(--teal)] hover:underline flex items-center gap-1.5"
            >
              <span>{doc.name}</span>
            </Link>
            <span className="text-xs text-[var(--muted-text)] truncate flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
              {doc.email}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) => {
        return (
          <Badge
            variant="outline"
            className="text-xs font-normal border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)]"
          >
            {row.original.specialization}
          </Badge>
        );
      },
    },
    {
      accessorKey: "hospital",
      header: "Hospital",
      cell: ({ row }) => {
        return (
          <div className="text-xs text-[var(--ink)] flex items-center gap-1.5 max-w-[200px] truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{row.original.hospital}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return (
          <span className="text-xs text-[var(--muted-text)] font-mono">
            {row.original.phone}
          </span>
        );
      },
    },
    {
      accessorKey: "patientCount",
      header: () => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleSortToggle("patientCount")}
            className="flex items-center text-xs font-semibold hover:text-[var(--ink)] focus:outline-none"
          >
            Patients
            {getSortIcon("patientCount")}
          </button>
        </div>
      ),
      cell: ({ row }) => {
        const count = row.original.patientCount || 0;
        const pct = Math.min(100, Math.round((count / maxPatients) * 100));

        return (
          <div className="flex items-center justify-end gap-2.5">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden lg:block">
              <div
                className="h-full bg-[var(--teal)] rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-xs font-semibold text-[var(--ink)] min-w-[24px] text-right">
              {count}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <button
          type="button"
          onClick={() => handleSortToggle("createdAt")}
          className="flex items-center text-xs font-semibold hover:text-[var(--ink)] focus:outline-none"
        >
          Added
          {getSortIcon("createdAt")}
        </button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span
            className="text-xs text-[var(--muted-text)] cursor-help"
            title={format(date, "PPpp")}
          >
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-[var(--ink)] hover:bg-[var(--canvas)]"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-36 bg-[var(--surface)] border-[var(--line)]">
                <DropdownMenuItem className="text-xs">
                  <Link href={`/doctors/${doc._id}`} className="flex items-center w-full">
                    <Eye className="w-3.5 h-3.5 mr-2 text-[var(--teal)]" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs">
                  <Link href={`/doctors/${doc._id}#patients`} className="flex items-center w-full">
                    <Users className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    View Patients
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Mobile card view renderer
  const renderMobileCard = (doc: Doctor) => {
    return (
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/doctors/${doc._id}`}
              className="font-heading font-medium text-sm text-[var(--ink)] hover:text-[var(--teal)] flex items-center gap-1.5"
            >
              {doc.name}
            </Link>
            <div className="text-xs text-[var(--muted-text)] mt-0.5">
              {doc.email}
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] font-normal border-[var(--line)] bg-[var(--canvas)] shrink-0"
          >
            {doc.specialization}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted-text)] pt-1">
          <div className="flex items-center gap-1.5 truncate">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{doc.hospital}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{doc.phone}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/60 text-xs">
          <div className="flex items-center gap-1.5 text-[var(--muted-text)]">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{format(new Date(doc.createdAt), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted-text)]">Patients:</span>
            <span className="font-mono font-semibold text-[var(--teal)] bg-[var(--teal-soft)]/50 px-2 py-0.5 rounded text-xs">
              {doc.patientCount || 0}
            </span>
            <Link href={`/doctors/${doc._id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs border-[var(--line)] text-[var(--teal)] hover:bg-[var(--teal-soft)]/20 ml-1"
              >
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--teal-soft)]/50 border border-teal-200 text-[var(--teal)] flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h1 className="font-heading text-2xl font-semibold text-[var(--ink)] tracking-tight">
              Doctors Directory
            </h1>
          </div>
          <p className="text-xs text-[var(--muted-text)] mt-1">
            Manage medical staff, view patient rosters, and monitor clinical load.
          </p>
        </div>

        <Button
          onClick={() => setAddSheetOpen(true)}
          className="bg-[var(--teal)] hover:bg-teal-700 text-white shadow-xs text-xs font-medium h-9 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add doctor
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search by doctor name, hospital, specialization, email..."
        searchValue={q}
        onSearchChange={(val) => {
          setPage(1);
          setQ(val);
        }}
        filters={filterConfigs}
        selectedFilters={{
          specialization: specs,
          hospital: hospital || undefined,
        }}
        onFilterChange={handleFilterChange}
        dateRange={{ from: from || undefined, to: to || undefined }}
        onDateRangeChange={handleDateRangeChange}
        onClearAll={handleClearAll}
        activeFilterCount={activeFilterCount}
        totalResults={pagination?.total}
        resultsLabel="doctors found"
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={doctors}
        pagination={pagination}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        error={error as Error}
        onRetry={() => refetch()}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPage(1);
          setLimit(newSize);
        }}
        renderMobileCard={renderMobileCard}
        emptyTitle={activeFilterCount > 0 ? "No doctors match these filters" : "No doctors yet"}
        emptyDescription={
          activeFilterCount > 0
            ? "Try resetting filters or adjusting your search term."
            : "Get started by adding your first doctor to the hospital directory."
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
              onClick={() => setAddSheetOpen(true)}
              className="text-xs bg-[var(--teal)] text-white hover:bg-teal-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add doctor
            </Button>
          )
        }
      />

      {/* Add Doctor Sheet */}
      <AddDoctorSheet
        open={addSheetOpen}
        onOpenChange={setAddSheetOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-6 space-y-4">
          <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-64 w-full bg-slate-100 rounded-xl animate-pulse" />
        </div>
      }
    >
      <DoctorsContent />
    </React.Suspense>
  );
}

