import api, { ApiResponse } from "./index";

export interface MedicationRequest {
  name: string;
  dosage: string;
  unit: string;
  purpose: string;
  instruction?: string;
  pharmacyInfo?: string;
  imageUrl?: string;
  color?: string;
  shape?: string;
  startDate?: string;
  endDate?: string;
  refillDate?: string;
  prescribedBy?: string;
}

export interface MedicationResponse {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  purpose: string;
  userId: string;
  instruction: string | null;
  pharmacyInfo: string | null;
  imageUrl: string | null;
  color: string | null;
  shape: string | null;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  refillDate: string | null;
  prescribedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationUpdateRequest {
  name?: string;
  dosage?: string;
  unit?: string;
  purpose?: string;
  instruction?: string;
  pharmacyInfo?: string;
  imageUrl?: string;
  color?: string;
  shape?: string;
  startDate?: string;
  endDate?: string;
  refillDate?: string;
  prescribedBy?: string;
}

export const medicationApi = {
  add: (body: MedicationRequest) =>
    api.post<ApiResponse<MedicationResponse>>("/api/medication/add", body),

  getAll: () =>
    api.get<ApiResponse<MedicationResponse[]>>("/api/medication/all"),

  getById: (id: string) =>
    api.get<ApiResponse<MedicationResponse>>(`/api/medication/${id}`),

  update: (id: string, body: MedicationUpdateRequest) =>
    api.put<ApiResponse<MedicationResponse>>(`/api/medication/${id}`, body),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/medication/${id}`),
};
