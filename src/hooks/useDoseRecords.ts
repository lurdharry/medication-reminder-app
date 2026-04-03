import { useState, useCallback } from "react";
import { doseRecordApi, DoseRecordResponse } from "@/services/api/doseRecordApi";

export const useDoseRecords = () => {
  const [records, setRecords] = useState<DoseRecordResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doseRecordApi.getHistory();
      setRecords(response.data.data);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load history";
      setError(message);
      console.error("Error loading dose history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistoryByMedication = useCallback(async (medicationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await doseRecordApi.getHistoryByMedication(medicationId);
      setRecords(response.data.data);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load history";
      setError(message);
      console.error("Error loading medication history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const recordDose = useCallback(async (scheduleId: string, status: "taken" | "skipped") => {
    try {
      const response = await doseRecordApi.record(scheduleId, { status });
      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to record dose";
      console.error("Error recording dose:", err);
      throw new Error(message);
    }
  }, []);

  return {
    records,
    loading,
    error,
    fetchHistory,
    fetchHistoryByMedication,
    recordDose,
  };
};
