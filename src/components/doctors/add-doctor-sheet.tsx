"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormSheet } from "@/components/ui/form-sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPECIALIZATIONS } from "@/types";
import { useCreateDoctor } from "@/hooks/use-doctors";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

const addDoctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  specialization: z.string().min(1, "Please select a specialization"),
  hospital: z.string().trim().min(2, "Hospital must be at least 2 characters").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Please enter a valid phone number (e.g. +8801700000000)"),
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
});

type AddDoctorFormData = z.infer<typeof addDoctorSchema>;

interface AddDoctorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddDoctorSheet({
  open,
  onOpenChange,
  onSuccess,
}: AddDoctorSheetProps) {
  const { mutateAsync: createDoctor, isPending } = useCreateDoctor();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddDoctorFormData>({
    resolver: zodResolver(addDoctorSchema),
    defaultValues: {
      name: "",
      specialization: "",
      hospital: "",
      phone: "",
      email: "",
    },
  });

  const selectedSpecialization = watch("specialization");

  // Reset form when opened/closed
  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: AddDoctorFormData) => {
    try {
      await createDoctor(data);
      toast.success("Doctor created successfully", {
        description: `Dr. ${data.name} has been added to the registry.`,
      });
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          err.details.forEach((d) => {
            setError(d.field as keyof AddDoctorFormData, {
              type: "server",
              message: d.message,
            });
          });
        } else {
          toast.error("Failed to create doctor", {
            description: err.message,
          });
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Doctor"
      description="Register a doctor in the ward management directory."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="doc-name">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <Input
            id="doc-name"
            placeholder="e.g. Dr. Sarah Jenkins"
            {...register("name")}
            className={`h-9 text-xs bg-[var(--surface)] border-[var(--line)] ${
              errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Specialization */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="doc-spec">
            Specialization <span className="text-rose-500">*</span>
          </label>
          <Select
            value={selectedSpecialization}
            onValueChange={(val) => {
              if (val) setValue("specialization", val, { shouldValidate: true });
            }}
          >
            <SelectTrigger
              id="doc-spec"
              className={`h-9 w-full text-xs bg-[var(--surface)] border-[var(--line)] ${
                errors.specialization ? "border-rose-500 focus-visible:ring-rose-500" : ""
              }`}
            >
              <SelectValue placeholder="Select medical specialization" />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-[var(--surface)] border-[var(--line)]">
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec} className="text-xs">
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.specialization && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.specialization.message}
            </p>
          )}
        </div>

        {/* Hospital */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="doc-hosp">
            Hospital / Clinic <span className="text-rose-500">*</span>
          </label>
          <Input
            id="doc-hosp"
            placeholder="e.g. Dhaka Medical College Hospital"
            {...register("hospital")}
            className={`h-9 text-xs bg-[var(--surface)] border-[var(--line)] ${
              errors.hospital ? "border-rose-500 focus-visible:ring-rose-500" : ""
            }`}
          />
          {errors.hospital && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.hospital.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="doc-phone">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <Input
            id="doc-phone"
            placeholder="e.g. +8801712345678"
            {...register("phone")}
            className={`h-9 text-xs bg-[var(--surface)] border-[var(--line)] ${
              errors.phone ? "border-rose-500 focus-visible:ring-rose-500" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="doc-email">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <Input
            id="doc-email"
            type="email"
            placeholder="e.g. s.jenkins@hospital.org"
            {...register("email")}
            className={`h-9 text-xs bg-[var(--surface)] border-[var(--line)] ${
              errors.email ? "border-rose-500 focus-visible:ring-rose-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[var(--line)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="text-xs border-[var(--line)] text-[var(--ink)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="text-xs bg-[var(--teal)] text-white hover:bg-teal-700 min-w-[100px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save doctor"
            )}
          </Button>
        </div>
      </form>
    </FormSheet>
  );
}
