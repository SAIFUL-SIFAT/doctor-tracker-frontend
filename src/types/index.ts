export type Specialization =
  | 'Cardiology'
  | 'Dermatology'
  | 'Endocrinology'
  | 'Gastroenterology'
  | 'General Medicine'
  | 'Neurology'
  | 'Obstetrics & Gynecology'
  | 'Oncology'
  | 'Orthopedics'
  | 'Pediatrics'
  | 'Psychiatry'
  | 'Pulmonology'
  | 'Radiology'
  | 'Urology';

export const SPECIALIZATIONS: Specialization[] = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Medicine',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology',
];

export type Condition =
  | 'Hypertension'
  | 'Diabetes'
  | 'Asthma'
  | 'Arthritis'
  | 'Migraine'
  | 'Anxiety'
  | 'Fracture'
  | 'Skin Allergy'
  | 'Gastritis'
  | 'Thyroid Disorder'
  | 'Heart Disease'
  | 'Other';

export const CONDITIONS: Condition[] = [
  'Hypertension',
  'Diabetes',
  'Asthma',
  'Arthritis',
  'Migraine',
  'Anxiety',
  'Fracture',
  'Skin Allergy',
  'Gastritis',
  'Thyroid Disorder',
  'Heart Disease',
  'Other',
];

export type PatientStatus = 'active' | 'follow_up' | 'discharged';
export const PATIENT_STATUSES: PatientStatus[] = ['active', 'follow_up', 'discharged'];

export type Gender = 'male' | 'female' | 'other';
export const GENDERS: Gender[] = ['male', 'female', 'other'];

export interface Doctor {
  _id: string;
  name: string;
  nameLower?: string;
  specialization: Specialization;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  doctorId: string | Doctor;
  name: string;
  nameLower?: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  condition: Condition;
  status: PatientStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DoctorFilterMeta {
  specializations: string[];
  hospitals: string[];
}
