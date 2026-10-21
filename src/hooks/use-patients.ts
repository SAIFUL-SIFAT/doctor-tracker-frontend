import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Patient, PaginatedResponse, Condition, PatientStatus } from "@/types";

export interface PatientListParams {
  page?: number;
  limit?: number;
  q?: string;
  condition?: string | string[];
  status?: string;
  doctorId?: string;
  from?: string;
  to?: string;
  sort?: string;
}

export function usePatients(params: PatientListParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));
  if (params.q) queryParams.set("q", params.q);
  if (params.condition) {
    if (Array.isArray(params.condition)) {
      if (params.condition.length > 0) {
        queryParams.set("condition", params.condition.join(","));
      }
    } else {
      queryParams.set("condition", params.condition);
    }
  }
  if (params.status) queryParams.set("status", params.status);
  if (params.doctorId) queryParams.set("doctorId", params.doctorId);
  if (params.from) queryParams.set("from", params.from);
  if (params.to) queryParams.set("to", params.to);
  if (params.sort) queryParams.set("sort", params.sort);

  const queryString = queryParams.toString();
  const endpoint = `/api/v1/patients${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => apiClient<PaginatedResponse<Patient>>(endpoint),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => apiClient<{ data: Patient }>(`/api/v1/patients/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export interface UpdatePatientData {
  name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  condition?: string;
  status?: string;
  notes?: string;
  doctorId?: string;
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientData }) =>
      apiClient<{ data: Patient }>(`/api/v1/patients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ data: { message: string } }>(`/api/v1/patients/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
