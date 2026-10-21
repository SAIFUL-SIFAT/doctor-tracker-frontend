"use client";

import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  description = "No items match your criteria or none have been added yet.",
  action,
  icon: Icon = FolderOpen,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--canvas)]/50",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--teal-soft)]/50 text-[var(--teal)] flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-heading font-medium text-base text-[var(--ink)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--muted-text)] max-w-sm mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
