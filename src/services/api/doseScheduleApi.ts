import api, { ApiResponse } from "./index";

export interface DoseScheduleRequest {
  time: string;
}

export interface DoseScheduleResponse {
  id: string;
  medicationId: string;
  time: string;
  createdAt: string;
}

export const doseScheduleApi = {
  add: (medicationId: string, body: DoseScheduleRequest) =>
    api.post<ApiResponse<DoseScheduleResponse>>(
      `/api/medication/${medicationId}/schedules`,
      body
    ),

  getAll: (medicationId: string) =>
    api.get<ApiResponse<DoseScheduleResponse[]>>(
      `/api/medication/${medicationId}/schedules`
    ),

  update: (medicationId: string, id: string, body: DoseScheduleRequest) =>
    api.put<ApiResponse<DoseScheduleResponse>>(
      `/api/medication/${medicationId}/schedules/${id}`,
      body
    ),

  delete: (medicationId: string, id: string) =>
    api.delete<ApiResponse<null>>(
      `/api/medication/${medicationId}/schedules/${id}`
    ),
};
