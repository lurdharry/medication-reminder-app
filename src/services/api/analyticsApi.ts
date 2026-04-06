import api, { ApiResponse } from "./index";

export interface MedicationAdherence {
  medicationId: string;
  medicationName: string;
  totalDoses: number;
  taken: number;
  skipped: number;
  missed: number;
  adherenceRate: number;
}

export interface AdherenceResponse {
  totalDoses: number;
  taken: number;
  skipped: number;
  missed: number;
  adherenceRate: number;
  currentStreak: number;
  perMedication: MedicationAdherence[];
}
export interface PatternResponse {
  bestTimeOfDay: string;
  worstTimeOfDay: string;
  bestDayOfWeek: string;
  adherenceTrend: string;
  suggestions: string[];
}

export const analyticsApi = {
  getAdherence: (days: number = 7) =>
    api.get<ApiResponse<AdherenceResponse>>(`/api/analytics/adherence?days=${days}`),

  getPatterns: (days: number = 30) =>
    api.get<ApiResponse<PatternResponse>>(`/api/analytics/patterns?days=${days}`),
};
