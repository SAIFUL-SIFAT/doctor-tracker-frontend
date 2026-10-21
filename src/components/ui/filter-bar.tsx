"use client";

import * as React from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DateRangePicker } from "./date-range-picker";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  multi?: boolean;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterConfig[];
  selectedFilters: Record<string, string[] | string | undefined>;
  onFilterChange: (id: string, value: string[] | string | undefined) => void;
  dateRange?: { from?: string; to?: string };
  onDateRangeChange?: (from?: string, to?: string) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  totalResults?: number;
  resultsLabel?: string;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  selectedFilters,
  onFilterChange,
  dateRange,
  onDateRangeChange,
  onClearAll,
  activeFilterCount,
  totalResults,
  resultsLabel = "results",
}: FilterBarProps) {
  // Local state for debounced search typing
  const [localSearch, setLocalSearch] = React.useState(searchValue);
  const [prevSearchValue, setPrevSearchValue] = React.useState(searchValue);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  if (searchValue !== prevSearchValue) {
    setPrevSearchValue(searchValue);
    setLocalSearch(searchValue);
  }

  // Debounce search update
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localSearch, searchValue, onSearchChange]);

  const handleMultiToggle = (filterId: string, optionValue: string) => {
    const current = selectedFilters[filterId];
    let arr: string[] = [];
    if (Array.isArray(current)) {
      arr = [...current];
    } else if (typeof current === "string" && current) {
      arr = [current];
    }

    if (arr.includes(optionValue)) {
      arr = arr.filter((x) => x !== optionValue);
    } else {
      arr.push(optionValue);
    }
    onFilterChange(filterId, arr.length > 0 ? arr : undefined);
  };

  const handleSingleSelect = (filterId: string, optionValue: string) => {
    const current = selectedFilters[filterId];
    if (current === optionValue) {
      onFilterChange(filterId, undefined);
    } else {
      onFilterChange(filterId, optionValue);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Main Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-text)]" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8.5 pr-8 h-9 text-xs bg-[var(--surface)] border-[var(--line)] rounded-lg text-[var(--ink)] placeholder:text-[var(--muted-text)] focus-visible:ring-1 focus-visible:ring-[var(--teal)]"
          />
          {localSearch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-[var(--muted-text)] hover:text-rose-500"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Desktop Filter Popovers */}
        <div className="hidden md:flex items-center gap-2">
          {filters.map((filter) => {
            const current = selectedFilters[filter.id];
            const isSelected = Array.isArray(current)
              ? current.length > 0
              : Boolean(current);
            const count = Array.isArray(current) ? current.length : current ? 1 : 0;

            return (
              <Popover key={filter.id}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-9 text-xs border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--canvas)] ${
                        isSelected ? "border-teal-500/80 bg-[var(--teal-soft)]/20 text-[var(--teal)] font-medium" : "text-[var(--ink)]"
                      }`}
                    >
                      <span>{filter.label}</span>
                      {count > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[var(--teal)] text-white text-[10px] font-semibold">
                          {count}
                        </span>
                      )}
                    </Button>
                  }
                />
                <PopoverContent className="w-56 p-2 bg-[var(--surface)] border-[var(--line)] shadow-lg" align="start">
                  <div className="text-xs font-semibold text-[var(--ink)] px-2 py-1 border-b border-[var(--line)] mb-1">
                    Filter by {filter.label}
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {filter.options.map((opt) => {
                      const active = Array.isArray(current)
                        ? current.includes(opt.value)
                        : current === opt.value;

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            filter.multi
                              ? handleMultiToggle(filter.id, opt.value)
                              : handleSingleSelect(filter.id, opt.value)
                          }
                          className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                            active
                              ? "bg-[var(--teal-soft)] text-[var(--teal)] font-medium"
                              : "text-[var(--ink)] hover:bg-[var(--canvas)]"
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {active && <span className="text-[var(--teal)] text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}

          {/* Date Range Picker */}
          {onDateRangeChange && (
            <DateRangePicker
              from={dateRange?.from}
              to={dateRange?.to}
              onSelect={onDateRangeChange}
            />
          )}

          {/* Clear all button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-9 text-xs text-[var(--muted-text)] hover:text-rose-600 hover:bg-rose-50"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        {/* Mobile Filter Button (below md) */}
        <div className="md:hidden">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 text-xs border-[var(--line)] bg-[var(--surface)] ${
                    activeFilterCount > 0
                      ? "border-teal-500 bg-[var(--teal-soft)]/20 text-[var(--teal)] font-medium"
                      : "text-[var(--ink)]"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[var(--teal)] text-white text-[10px]">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              }
            />
            <SheetContent side="bottom" className="bg-[var(--surface)] border-t border-[var(--line)] max-h-[85vh] overflow-y-auto">
              <SheetHeader className="pb-3 border-b border-[var(--line)]">
                <SheetTitle className="text-sm font-semibold text-[var(--ink)]">
                  Filter Options
                </SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-5">
                {filters.map((filter) => {
                  const current = selectedFilters[filter.id];
                  return (
                    <div key={filter.id} className="space-y-2">
                      <div className="text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
                        {filter.label}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {filter.options.map((opt) => {
                          const active = Array.isArray(current)
                            ? current.includes(opt.value)
                            : current === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                filter.multi
                                  ? handleMultiToggle(filter.id, opt.value)
                                  : handleSingleSelect(filter.id, opt.value)
                              }
                              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                                active
                                  ? "bg-[var(--teal)] border-[var(--teal)] text-white font-medium"
                                  : "border-[var(--line)] bg-[var(--canvas)] text-[var(--ink)]"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Date Range */}
                {onDateRangeChange && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
                      Created Date Range
                    </div>
                    <DateRangePicker
                      from={dateRange?.from}
                      to={dateRange?.to}
                      onSelect={onDateRangeChange}
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-xs border-[var(--line)]"
                    onClick={() => {
                      onClearAll();
                      setMobileFiltersOpen(false);
                    }}
                  >
                    Reset All
                  </Button>
                  <Button
                    className="flex-1 text-xs bg-[var(--teal)] text-white"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Active Filter Chips & Result Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Chips list */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.flatMap((filter) => {
            const current = selectedFilters[filter.id];
            if (!current) return [];

            const values = Array.isArray(current) ? current : [current];
            return values.map((val) => {
              const opt = filter.options.find((o) => o.value === val);
              const label = opt ? opt.label : val;

              return (
                <Badge
                  key={`${filter.id}-${val}`}
                  variant="secondary"
                  className="bg-[var(--teal-soft)]/60 text-[var(--teal)] border border-teal-200/50 hover:bg-[var(--teal-soft)] gap-1 px-2 py-0.5 text-xs font-normal"
                >
                  <span className="text-[10px] text-[var(--muted-text)] mr-0.5">{filter.label}:</span>
                  <span>{label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      filter.multi
                        ? handleMultiToggle(filter.id, val)
                        : handleSingleSelect(filter.id, val)
                    }
                    className="ml-1 hover:text-rose-600 focus:outline-none"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            });
          })}

          {/* Date range chip */}
          {(dateRange?.from || dateRange?.to) && (
            <Badge
              variant="secondary"
              className="bg-[var(--teal-soft)]/60 text-[var(--teal)] border border-teal-200/50 hover:bg-[var(--teal-soft)] gap-1 px-2 py-0.5 text-xs font-normal"
            >
              <span className="text-[10px] text-[var(--muted-text)] mr-0.5">Date:</span>
              <span>
                {dateRange.from} {dateRange.to ? `to ${dateRange.to}` : ""}
              </span>
              <button
                type="button"
                onClick={() => onDateRangeChange && onDateRangeChange(undefined, undefined)}
                className="ml-1 hover:text-rose-600 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {/* Search query chip */}
          {searchValue && (
            <Badge
              variant="secondary"
              className="bg-[var(--canvas)] text-[var(--ink)] border border-[var(--line)] gap-1 px-2 py-0.5 text-xs font-normal"
            >
              <span className="text-[10px] text-[var(--muted-text)] mr-0.5">Search:</span>
              <span>&ldquo;{searchValue}&rdquo;</span>
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
                  onSearchChange("");
                }}
                className="ml-1 hover:text-rose-600 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>

        {/* Live results count readout */}
        {totalResults !== undefined && (
          <div
            className="text-xs text-[var(--muted-text)] ml-auto"
            aria-live="polite"
          >
            {totalResults.toLocaleString()} {resultsLabel}
          </div>
        )}
      </div>
    </div>
  );
}
