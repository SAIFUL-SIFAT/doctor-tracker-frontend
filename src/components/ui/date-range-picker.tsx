"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onSelect: (from?: string, to?: string) => void;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onSelect,
  className,
}: DateRangePickerProps) {
  const dateRange = React.useMemo(() => {
    return {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };
  }, [from, to]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 text-xs font-normal justify-start border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--canvas)]",
                !from && !to && "text-[var(--muted-text)]"
              )}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-[var(--muted-text)]" />
              {from ? (
                to ? (
                  <>
                    {format(new Date(from), "LLL dd, y")} – {format(new Date(to), "LLL dd, y")}
                  </>
                ) : (
                  <>From {format(new Date(from), "LLL dd, y")}</>
                )
              ) : (
                <span>Date range</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0 bg-[var(--surface)] border-[var(--line)] shadow-lg" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange.from || new Date()}
            selected={dateRange}
            onSelect={(range: { from?: Date; to?: Date } | undefined) => {
              const f = range?.from ? format(range.from, "yyyy-MM-dd") : undefined;
              const t = range?.to ? format(range.to, "yyyy-MM-dd") : undefined;
              onSelect(f, t);
            }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>

      {(from || to) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSelect(undefined, undefined)}
          className="h-7 w-7 text-[var(--muted-text)] hover:text-rose-500"
          title="Clear date range"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
