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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CONDITIONS, GENDERS, PATIENT_STATUSES, Patient, Doctor } from "@/types";
import { useUpdatePatient } from "@/hooks/use-patients";
import { useDoctors } from "@/hooks/use-doctors";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { Loader2, Check, ChevronsUpDown, Stethoscope, Building2 } from "lucide-react";
import { cn } from "cn";

const editPatientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  age: z.coerce.number().int().min(0, "Age must be 0 or greater").max(120, "Age must be at most 120"),
  gender: z.string().min(1, "Please select gender"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").or(z.literal("")).optional(),
  condition: z.string().min(1, "Please select clinical condition"),
  status: z.string().min(1),
  doctorId: z.string().min(1, "Please assign a doctor"),
  notes: z.string().max(500, "Notes must be under 500 characters").optional().or(z.literal("")),
});

type EditPatientFormData = z.infer<typeof editPatientSchema>;

interface EditPatientSheetProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditPatientSheet({
  patient,
  open,
  onOpenChange,
  onSuccess,
}: EditPatientSheetProps) {
  const { mutateAsync: updatePatient, isPending } = useUpdatePatient();
  const [doctorPickerOpen, setDoctorPickerOpen] = React.useState(false);
  const [doctorSearch, setDoctorSearch] = React.useState("");

  // Fetch doctors for combobox re-assignment
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors({
    limit: 50,
    q: doctorSearch || undefined,
  });
  const doctorsList = doctorsData?.data || [];

  const initialDoctorId = React.useMemo(() => {
    if (!patient?.doctorId) return "";
    return typeof patient.doctorId === "object"
      ? (patient.doctorId as Doctor)._id
      : (patient.doctorId as string);
  }, [patient]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema) as any,
    defaultValues: {
      name: "",
      age: 30,
      gender: "male",
      phone: "",
      email: "",
      condition: "Hypertension",
      status: "active",
      doctorId: "",
      notes: "",
    },
  });

  const selectedGender = watch("gender");
  const selectedCondition = watch("condition");
  const selectedStatus = watch("status");
  const selectedDoctorId = watch("doctorId");

  // Synchronize form when patient opens or changes
  React.useEffect(() => {
    if (patient && open) {
      const docId =
        typeof patient.doctorId === "object"
          ? (patient.doctorId as Doctor)._id
          : (patient.doctorId as string);

      reset({
        name: patient.name || "",
        age: patient.age ?? 30,
        gender: patient.gender || "male",
        phone: patient.phone || "",
        email: patient.email || "",
        condition: patient.condition || "Hypertension",
        status: patient.status || "active",
        doctorId: docId || "",
        notes: patient.notes || "",
      });
    }
  }, [patient, open, reset]);

  // Find currently selected doctor label
  const selectedDoctor = React.useMemo(() => {
    if (!selectedDoctorId) return null;
    const foundInList = doctorsList.find((d) => d._id === selectedDoctorId);
    if (foundInList) return foundInList;
    if (
      patient?.doctorId &&
      typeof patient.doctorId === "object" &&
      (patient.doctorId as Doctor)._id === selectedDoctorId
    ) {
      return patient.doctorId as Doctor;
    }
    return null;
  }, [selectedDoctorId, doctorsList, patient]);

  const onSubmit = async (data: EditPatientFormData) => {
    if (!patient) return;

    try {
      await updatePatient({
        id: patient._id,
        data: {
          name: data.name,
          age: Number(data.age),
          gender: data.gender,
          phone: data.phone,
          email: data.email || undefined,
          condition: data.condition,
          status: data.status,
          doctorId: data.doctorId,
          notes: data.notes || undefined,
        },
      });

      toast.success("Patient updated successfully", {
        description: `Changes saved for ${data.name}.`,
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.details && err.details.length > 0) {
          err.details.forEach((d) => {
            if (d.field) {
              setError(d.field as keyof EditPatientFormData, {
                type: "server",
                message: d.message,
              });
            }
          });
          toast.error("Validation failed", {
            description: err.message,
          });
          return;
        }
        toast.error("Error updating patient", {
          description: err.message,
        });
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Patient"
      description="Update demographic details, condition status, or re-assign to a new doctor."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="e.g. John Doe"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Age <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min={0}
              max={120}
              placeholder="35"
              {...register("age", { valueAsNumber: true })}
              aria-invalid={!!errors.age}
            />
            {errors.age && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.age.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gender <span className="text-rose-500">*</span>
            </label>
            <Select
              value={selectedGender}
              onValueChange={(val) =>
                setValue("gender", val || "male", { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.gender.message}
              </p>
            )}
          </div>
        </div>

        {/* Assigned Doctor (Combobox for Re-assignment) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Assigned Doctor <span className="text-rose-500">*</span>
          </label>
          <Popover open={doctorPickerOpen} onOpenChange={setDoctorPickerOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  type="button"
                  role="combobox"
                  aria-expanded={doctorPickerOpen}
                  className="w-full justify-between h-10 font-normal border-[var(--line)] bg-[var(--surface)] text-left"
                />
              }
            >
              {selectedDoctor ? (
                <div className="flex items-center gap-2 truncate">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="font-medium text-[var(--ink)]">
                    Dr. {selectedDoctor.name}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    ({selectedDoctor.specialization})
                  </span>
                </div>
              ) : (
                <span className="text-slate-400">Select doctor to assign</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search doctor by name..."
                  value={doctorSearch}
                  onValueChange={setDoctorSearch}
                />
                <CommandList>
                  {doctorsLoading ? (
                    <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                      Loading doctors...
                    </div>
                  ) : doctorsList.length === 0 ? (
                    <CommandEmpty>No doctors found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {doctorsList.map((doc) => {
                        const isSelected = selectedDoctorId === doc._id;
                        return (
                          <CommandItem
                            key={doc._id}
                            value={doc._id}
                            onSelect={() => {
                              setValue("doctorId", doc._id, { shouldValidate: true });
                              setDoctorPickerOpen(false);
                            }}
                            className="flex items-center justify-between py-2 cursor-pointer"
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className="font-medium text-xs text-[var(--ink)] truncate">
                                Dr. {doc.name}
                              </span>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <span>{doc.specialization}</span>
                                <span>•</span>
                                <span className="truncate">{doc.hospital}</span>
                              </span>
                            </div>
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0 text-teal-600",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.doctorId && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.doctorId.message}
            </p>
          )}
        </div>

        {/* Condition & Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Condition <span className="text-rose-500">*</span>
            </label>
            <Select
              value={selectedCondition}
              onValueChange={(val) =>
                setValue("condition", val || "Hypertension", { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.condition && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.condition.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status <span className="text-rose-500">*</span>
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(val) =>
                setValue("status", val || "active", { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {PATIENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "follow_up" ? "Follow-up" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <Input
            placeholder="+1 555-0199"
            {...register("phone")}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Email Address <span className="text-xs text-slate-400 font-normal">(Optional)</span>
          </label>
          <Input
            type="email"
            placeholder="patient@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Clinical Notes <span className="text-xs text-slate-400 font-normal">(Optional)</span>
          </label>
          <Textarea
            rows={3}
            placeholder="Relevant medical history, allergies, or observations..."
            {...register("notes")}
            aria-invalid={!!errors.notes}
          />
          {errors.notes && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.notes.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-2 border-t border-[var(--line)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2 font-medium"
            disabled={isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </FormSheet>
  );
}
