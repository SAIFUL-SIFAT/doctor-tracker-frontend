"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] bg-[var(--surface)] text-[var(--ink)] border-l border-[var(--line)] p-0 flex flex-col h-full shadow-2xl z-50"
      >
        <SheetHeader className="px-6 py-5 border-b border-[var(--line)] bg-[var(--canvas)]/40 shrink-0">
          <SheetTitle className="font-heading text-lg font-semibold text-[var(--ink)] tracking-tight">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-xs text-[var(--muted-text)] mt-1">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
