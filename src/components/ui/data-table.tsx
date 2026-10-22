"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationMeta } from "@/types";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle, RefreshCw } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: PaginationMeta;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  renderMobileCard?: (item: TData) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  isLoading = false,
  isFetching = false,
  isError = false,
  error,
  onRetry,
  onPageChange,
  onPageSizeChange,
  sorting,
  onSortingChange,
  renderMobileCard,
  emptyTitle = "No records found",
  emptyDescription = "There are no items to display at this time.",
  emptyAction,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting: sorting || [],
    },
    onSortingChange: (updater) => {
      if (onSortingChange) {
        const next = typeof updater === "function" ? updater(sorting || []) : updater;
        onSortingChange(next);
      }
    },
  });

  // Calculate row number range
  const startItem = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endItem = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-3">
      {/* Table container with subtle card frame */}
      <div className="relative rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-xs">
        {/* Subtle fetching indicator bar */}
        {isFetching && !isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-teal-500 overflow-hidden z-10">
            <div className="h-full bg-teal-300 w-1/3 animate-[shimmer_1.5s_infinite_linear]" />
          </div>
        )}

        {/* Error state */}
        {isError ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-medium text-base text-[var(--ink)]">
                Unable to load data
              </h3>
              <p className="text-xs text-[var(--muted-text)] max-w-sm">
                {error?.message || "There was a problem communicating with the server. Please try again."}
              </p>
            </div>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-2 text-xs border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)]"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retry
              </Button>
            )}
          </div>
        ) : isLoading ? (
          /* Desktop Skeleton */
          <div className="p-4 space-y-3">
            <div className="hidden md:block">
              <div className="space-y-2">
                <Skeleton className="h-9 w-full bg-slate-100 dark:bg-slate-800" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-slate-50 dark:bg-slate-800/60" />
                ))}
              </div>
            </div>
            {/* Mobile Skeleton */}
            <div className="md:hidden space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={emptyAction}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className={`hidden md:block overflow-x-auto ${isFetching ? "opacity-65 transition-opacity" : ""}`}>
              <Table>
                <TableHeader className="bg-[var(--canvas)]/60">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b border-[var(--line)] hover:bg-transparent">
                      {headerGroup.headers.map((header) => {
                        const metaClass = (header.column.columnDef.meta as { className?: string })?.className || "";
                        return (
                          <TableHead
                            key={header.id}
                            className={`h-10 text-xs font-semibold text-[var(--muted-text)] tracking-wider uppercase px-4 ${metaClass}`}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="h-[52px] border-b border-[var(--line)]/60 hover:bg-[var(--teal-soft)]/20 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const metaClass = (cell.column.columnDef.meta as { className?: string })?.className || "";
                        return (
                          <TableCell key={cell.id} className={`px-4 py-2.5 text-sm text-[var(--ink)] ${metaClass}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View (renders on screens < md) */}
            <div className={`md:hidden divide-y divide-[var(--line)]/60 ${isFetching ? "opacity-65 transition-opacity" : ""}`}>
              {data.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-[var(--canvas)]/40 transition-colors">
                  {renderMobileCard ? (
                    renderMobileCard(item)
                  ) : (
                    <pre className="text-xs overflow-auto">{JSON.stringify(item, null, 2)}</pre>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer & Pagination */}
      {pagination && pagination.total > 0 && !isLoading && !isError && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1">
          {/* Item count readout */}
          <div className="text-xs text-[var(--muted-text)] order-2 sm:order-1" aria-live="polite">
            Showing <span className="font-semibold text-[var(--ink)]">{startItem}</span> to{" "}
            <span className="font-semibold text-[var(--ink)]">{endItem}</span> of{" "}
            <span className="font-semibold text-[var(--ink)]">{pagination.total.toLocaleString()}</span> entries
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Page Size select */}
            {onPageSizeChange && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted-text)]">
                <span>Rows:</span>
                <Select
                  value={String(pagination.limit)}
                  onValueChange={(val) => onPageSizeChange(Number(val))}
                >
                  <SelectTrigger className="h-8 w-16 text-xs bg-[var(--surface)] border-[var(--line)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Pagination buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.hasPrev !== undefined ? !pagination.hasPrev : pagination.page <= 1}
                onClick={() => onPageChange && onPageChange(1)}
                title="First Page"
                className="h-8 w-8 border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] disabled:opacity-40"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.hasPrev !== undefined ? !pagination.hasPrev : pagination.page <= 1}
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                title="Previous Page"
                className="h-8 w-8 border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="px-2 text-xs font-medium text-[var(--ink)]">
                Page {pagination.page} of {Math.max(1, pagination.totalPages)}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={pagination.hasNext !== undefined ? !pagination.hasNext : pagination.page >= pagination.totalPages}
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                title="Next Page"
                className="h-8 w-8 border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={pagination.hasNext !== undefined ? !pagination.hasNext : pagination.page >= pagination.totalPages}
                onClick={() => onPageChange && onPageChange(pagination.totalPages)}
                title="Last Page"
                className="h-8 w-8 border-[var(--line)] text-[var(--ink)] bg-[var(--surface)] disabled:opacity-40"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
