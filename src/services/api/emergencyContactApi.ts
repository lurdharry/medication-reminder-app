import api, { ApiResponse } from "./index";

export interface EmergencyContactRequest {
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
  notifyOnMissedDose?: boolean;
  missedDoseThreshold?: number;
}

export interface EmergencyContactResponse {
  id: string;
  name: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
  notifyOnMissedDose: boolean;
  missedDoseThreshold: number | null;
  createdAt: string;
}

export const emergencyContactApi = {
  add: (body: EmergencyContactRequest) =>
    api.post<ApiResponse<EmergencyContactResponse>>(
      "/api/emergency-contacts",
      body
    ),

  getAll: () =>
    api.get<ApiResponse<EmergencyContactResponse[]>>(
      "/api/emergency-contacts"
    ),

  update: (id: string, body: Partial<EmergencyContactRequest>) =>
    api.put<ApiResponse<EmergencyContactResponse>>(
      `/api/emergency-contacts/${id}`,
      body
    ),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/emergency-contacts/${id}`),
};
