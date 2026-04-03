import { useState, useCallback } from "react";
import { analyticsApi, AdherenceResponse, MedicationAdherence } from "@/services/api/analyticsApi";

interface AdherenceStats {
  taken: number;
  missed: number;
  skipped: number;
  total: number;
  rate: number;
  streak: number;
}

export const useAdherence = () => {
  const [adherence, setAdherence] = useState<AdherenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdherence = useCallback(async (days: number = 7) => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getAdherence(days);
      setAdherence(response.data.data);
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load adherence";
      setError(message);
      console.error("Error loading adherence:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOverallStats = useCallback((): AdherenceStats => {
    if (!adherence) {
      return { taken: 0, missed: 0, skipped: 0, total: 0, rate: 0, streak: 0 };
    }

    return {
      taken: adherence.taken,
      missed: adherence.missed,
      skipped: adherence.skipped,
      total: adherence.totalDoses,
      rate: adherence.adherenceRate,
      streak: adherence.currentStreak,
    };
  }, [adherence]);

  const getMedicationStats = useCallback(
    (medicationId: string): MedicationAdherence | null => {
      if (!adherence) return null;
      return adherence.perMedication.find((m) => m.medicationId === medicationId) || null;
    },
    [adherence]
  );

  return {
    adherence,
    loading,
    error,
    fetchAdherence,
    getOverallStats,
    getMedicationStats,
  };
};
