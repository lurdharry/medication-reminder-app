import { useQuery } from "@tanstack/react-query";
import { analyticsApi, AdherenceResponse, MedicationAdherence } from "@/services/api/analyticsApi";
import { useAuth } from "@/contexts/AuthContext";

interface AdherenceStats {
  taken: number;
  missed: number;
  skipped: number;
  total: number;
  rate: number;
  streak: number;
}

export const useAdherence = (days: number = 7) => {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ["adherence", days],
    queryFn: async (): Promise<AdherenceResponse> => {
      const response = await analyticsApi.getAdherence(days);
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  const getOverallStats = (): AdherenceStats => {
    if (!query.data) {
      return { taken: 0, missed: 0, skipped: 0, total: 0, rate: 0, streak: 0 };
    }

    return {
      taken: query.data.taken,
      missed: query.data.missed,
      skipped: query.data.skipped,
      total: query.data.totalDoses,
      rate: query.data.adherenceRate,
      streak: query.data.currentStreak,
    };
  };

  const getMedicationStats = (medicationId: string): MedicationAdherence | null => {
    if (!query.data) return null;
    return query.data.perMedication.find((m) => m.medicationId === medicationId) || null;
  };

  return {
    adherence: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    getOverallStats,
    getMedicationStats,
  };
};
