"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormSheet } from "@/components/ui/form-sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONDITIONS, GENDERS, PATIENT_STATUSES } from "@/types";
import { useAddDoctorPatient } from "@/hooks/use-doctors";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

const addPatientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  age: z.number().int().min(0, "Age must be 0 or greater").max(120, "Age must be at most 120"),
  gender: z.string().min(1, "Please select gender"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").or(z.literal("")).optional(),
  condition: z.string().min(1, "Please select clinical condition"),
  status: z.string().min(1),
  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
});

type AddPatientFormData = z.infer<typeof addPatientSchema>;

interface AddPatientSheetProps {
  doctorId: string;
  doctorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPatientSheet({
  doctorId,
  doctorName,
  open,
  onOpenChange,
  onSuccess,
}: AddPatientSheetProps) {
  const { mutateAsync: addPatient, isPending } = useAddDoctorPatient(doctorId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddPatientFormData>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: {
      name: "",
      age: 35,
      gender: "male",
      phone: "",
      email: "",
      condition: "Hypertension",
      status: "active",
      notes: "",
    },
  });

  const selectedGender = watch("gender");
  const selectedCondition = watch("condition");
  const selectedStatus = watch("status");

  React.useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: AddPatientFormData) => {
    try {
      await addPatient(data);
      toast.success("Patient registered successfully", {
        description: `${data.name} assigned to ${doctorName ? `Dr. ${doctorName}` : "doctor"}.`,
      });
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          err.details.forEach((d) => {
            setError(d.field as keyof AddPatientFormData, {
              type: "server",
              message: d.message,
            });
          });
        } else {
          toast.error("Failed to register patient", {
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
      title="Add Patient"
      description={
        doctorName
          ? `Register and assign patient under Dr. ${doctorName}.`
          : "Register a new patient under this doctor."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="pat-name">
            Patient Full Name <span className="text-rose-500">*</span>
          </label>
          <Input
            id="pat-name"
            placeholder="e.g. Rahim Uddin"
            {...register("name")}
            className={`h-9 text-xs bg-[var(--surface)] border-[var(--line)] ${
              errors.name ? "border-rose-500" : ""
            }`}
          />
          {errors.name && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Age & Gender Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="pat-age">
              Age <span className="text-rose-500">*</span>
            </label>
            <Input
              id="pat-age"
              type="number"
              min={0}
              max={120}
              placeholder="e.g. 42"
              {...register("age", { valueAsNumber: true })}
              className={`h-9 text-xs bg-[var(--surface)] border-[var(--line)] ${
                errors.age ? "border-rose-500" : ""
              }`}
            />
            {errors.age && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.age.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="pat-gender">
              Gender <span className="text-rose-500">*</span>
            </label>
            <Select
              value={selectedGender}
              onValueChange={(val) => {
                if (val) setValue("gender", val, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="pat-gender" className="h-9 w-full text-xs bg-[var(--surface)] border-[var(--line)]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--surface)] border-[var(--line)]">
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g} className="text-xs capitalize">
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.gender.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="pat-phone">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <Input
            id="pat-phone"
            placeholder="e.g. +8801811223344"
            {...register("phone")}
            className={`h-9 text-xs bg-[var(--surface)] border-[var(--line)] ${
              errors.phone ? "border-rose-500" : ""
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
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="pat-email">
            Email (optional)
          </label>
          <Input
            id="pat-email"
            type="email"
            placeholder="e.g. rahim@example.com"
            {...register("email")}
            className={`h-9 text-xs bg-[var(--surface)] border-[var(--line)] ${
              errors.email ? "border-rose-500" : ""
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Condition & Status Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="pat-cond">
              Condition <span className="text-rose-500">*</span>
            </label>
            <Select
              value={selectedCondition}
              onValueChange={(val) => {
                if (val) setValue("condition", val, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="pat-cond" className="h-9 w-full text-xs bg-[var(--surface)] border-[var(--line)]">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-[var(--surface)] border-[var(--line)]">
                {CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.condition && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.condition.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="pat-stat">
              Status <span className="text-rose-500">*</span>
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                if (val) setValue("status", val, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="pat-stat" className="h-9 w-full text-xs bg-[var(--surface)] border-[var(--line)]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--surface)] border-[var(--line)]">
                {PATIENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs capitalize">
                    {s === "follow_up" ? "Follow-up" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--ink)]" htmlFor="pat-notes">
            Clinical Notes (optional)
          </label>
          <Textarea
            id="pat-notes"
            placeholder="Add relevant symptoms, dosage notes, or medical history..."
            {...register("notes")}
            className="text-xs bg-[var(--surface)] border-[var(--line)] min-h-[72px]"
          />
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
                Adding...
              </>
            ) : (
              "Add patient"
            )}
          </Button>
        </div>
      </form>
    </FormSheet>
  );
}
