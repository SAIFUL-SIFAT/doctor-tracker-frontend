"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Doctor,
  DoctorFilterMeta,
  PaginatedResponse,
  Patient,
} from "@/types";

export interface DoctorsQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  specialization?: string[];
  hospital?: string;
  from?: string;
  to?: string;
  sort?: string;
}

export function useDoctors(params: DoctorsQueryParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.q) searchParams.set("q", params.q);
  if (params.specialization && params.specialization.length > 0) {
    searchParams.set("specialization", params.specialization.join(","));
  }
  if (params.hospital) searchParams.set("hospital", params.hospital);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  const endpoint = `/api/v1/doctors${queryString ? `?${queryString}` : ""}`;

  return useQuery<PaginatedResponse<Doctor>>({
    queryKey: ["doctors", params],
    queryFn: () => apiClient<PaginatedResponse<Doctor>>(endpoint),
    staleTime: 30000,
  });
}

export function useDoctor(id: string) {
  return useQuery<{ data: Doctor }>({
    queryKey: ["doctor", id],
    queryFn: () => apiClient<{ data: Doctor }>(`/api/v1/doctors/${id}`),
    enabled: Boolean(id),
  });
}

export function useDoctorFilters() {
  return useQuery<{ data: DoctorFilterMeta }>({
    queryKey: ["doctors-filters"],
    queryFn: () => apiClient<{ data: DoctorFilterMeta }>("/api/v1/doctors/meta/filters"),
    staleTime: 5 * 60 * 1000, // 5 mins cache
  });
}

export interface DoctorPatientsQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  condition?: string[];
  status?: string;
  from?: string;
  to?: string;
  sort?: string;
}

export function useDoctorPatients(doctorId: string, params: DoctorPatientsQueryParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.q) searchParams.set("q", params.q);
  if (params.condition && params.condition.length > 0) {
    searchParams.set("condition", params.condition.join(","));
  }
  if (params.status) searchParams.set("status", params.status);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();
  const endpoint = `/api/v1/doctors/${doctorId}/patients${queryString ? `?${queryString}` : ""}`;

  return useQuery<PaginatedResponse<Patient>>({
    queryKey: ["doctor-patients", doctorId, params],
    queryFn: () => apiClient<PaginatedResponse<Patient>>(endpoint),
    enabled: Boolean(doctorId),
  });
}

export interface CreateDoctorData {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDoctorData) =>
      apiClient<{ data: Doctor }>("/api/v1/doctors", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors-filters"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export interface CreatePatientData {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  condition: string;
  status?: string;
  notes?: string;
}

export function useAddDoctorPatient(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientData) =>
      apiClient<{ data: Patient }>(`/api/v1/doctors/${doctorId}/patients`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patients", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctor", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRemoveDoctorPatient(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: string) =>
      apiClient<{ data: { message: string } }>(
        `/api/v1/doctors/${doctorId}/patients/${patientId}`,
        {
          method: "DELETE",
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-patients", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctor", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
