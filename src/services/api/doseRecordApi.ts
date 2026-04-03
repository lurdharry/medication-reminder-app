import api, { ApiResponse } from "./index";

export interface DoseRecordRequest {
  status: "taken" | "skipped";
}

export interface DoseRecordResponse {
  id: string;
  doseScheduleId: string;
  medicationId: string;
  userId: string;
  scheduledAt: string;
  status: string;
  recordedAt: string | null;
  createdAt: string;
}

export const doseRecordApi = {
  record: (scheduleId: string, body: DoseRecordRequest) =>
    api.post<ApiResponse<DoseRecordResponse>>(
      `/api/doses/${scheduleId}/record`,
      body
    ),

  getHistory: () =>
    api.get<ApiResponse<DoseRecordResponse[]>>("/api/doses/history"),

  getHistoryByMedication: (medicationId: string) =>
    api.get<ApiResponse<DoseRecordResponse[]>>(
      `/api/doses/history/${medicationId}`
    ),
};
