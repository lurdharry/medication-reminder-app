import { useState, useCallback, useEffect } from "react";
import { medicationApi, MedicationResponse } from "@/services/api/medicationApi";
import { doseScheduleApi, DoseScheduleResponse } from "@/services/api/doseScheduleApi";
import { doseRecordApi } from "@/services/api/doseRecordApi";
import { useAuth } from "@/contexts/AuthContext";
import { Medication } from "@/types";

interface MedicationInput {
  name: string;
  dosage: string;
  unit: string;
  purpose: string;
  instructions?: string;
  startDate?: Date;
  endDate?: Date;
  refillDate?: Date;
  prescribedBy?: string;
  pharmacyInfo?: string;
  imageUri?: string;
  color?: string;
  shape?: string;
  schedule?: { time: string }[];
}

const mapToMedication = (
  med: MedicationResponse,
  schedules: DoseScheduleResponse[]
): Medication => ({
  id: med.id,
  name: med.name,
  dosage: med.dosage,
  unit: med.unit as "mg" | "ml" | "pills",
  purpose: med.purpose,
  instructions: med.instruction || undefined,
  startDate: med.startDate ? new Date(med.startDate) : new Date(),
  endDate: med.endDate ? new Date(med.endDate) : undefined,
  refillDate: med.refillDate ? new Date(med.refillDate) : new Date(),
  prescribedBy: med.prescribedBy || undefined,
  pharmacyInfo: med.pharmacyInfo || undefined,
  imageUri: med.imageUrl || undefined,
  color: med.color || undefined,
  shape: med.shape || undefined,
  adherenceRate: 0,
  schedule: schedules.map((s) => ({
    id: s.id,
    time: s.time,
    taken: false,
    skipped: false,
  })),
});

export const useMedications = () => {
  const { isAuthenticated } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await medicationApi.getAll();
      const meds = response.data.data;

      const medicationsWithSchedules = await Promise.all(
        meds.map(async (med) => {
          const schedulesResponse = await doseScheduleApi.getAll(med.id);
          return mapToMedication(med, schedulesResponse.data.data);
        })
      );

      setMedications(medicationsWithSchedules);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load medications";
      setError(message);
      console.error("Error loading medications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMedications();
    }
  }, [isAuthenticated, fetchMedications]);

  const addMedication = useCallback(
    async (input: MedicationInput) => {
      const response = await medicationApi.add({
        name: input.name,
        dosage: input.dosage,
        unit: input.unit,
        purpose: input.purpose,
        instruction: input.instructions,
        startDate: input.startDate?.toISOString().split("T")[0],
        endDate: input.endDate?.toISOString().split("T")[0],
        refillDate: input.refillDate?.toISOString().split("T")[0],
        prescribedBy: input.prescribedBy,
        pharmacyInfo: input.pharmacyInfo,
        imageUrl: input.imageUri,
        color: input.color,
        shape: input.shape,
      });

      const newMedId = response.data.data.id;

      if (input.schedule) {
        for (const schedule of input.schedule) {
          await doseScheduleApi.add(newMedId, { time: schedule.time });
        }
      }

      await fetchMedications();
    },
    [fetchMedications]
  );

  const updateMedication = useCallback(
    async (id: string, input: Partial<MedicationInput>) => {
      await medicationApi.update(id, {
        name: input.name,
        dosage: input.dosage,
        unit: input.unit,
        purpose: input.purpose,
        instruction: input.instructions,
        prescribedBy: input.prescribedBy,
        pharmacyInfo: input.pharmacyInfo,
        imageUrl: input.imageUri,
        color: input.color,
        shape: input.shape,
      });

      await fetchMedications();
    },
    [fetchMedications]
  );

  const deleteMedication = useCallback(
    async (id: string) => {
      await medicationApi.delete(id);
      await fetchMedications();
    },
    [fetchMedications]
  );

  const getMedicationById = useCallback(
    (id: string): Medication | null => {
      return medications.find((m) => m.id === id) || null;
    },
    [medications]
  );

  const markDoseTaken = useCallback(
    async (scheduleId: string) => {
      await doseRecordApi.record(scheduleId, { status: "taken" });
      await fetchMedications();
    },
    [fetchMedications]
  );

  const markDoseSkipped = useCallback(
    async (scheduleId: string) => {
      await doseRecordApi.record(scheduleId, { status: "skipped" });
      await fetchMedications();
    },
    [fetchMedications]
  );

  return {
    medications,
    loading,
    error,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication,
    getMedicationById,
    markDoseTaken,
    markDoseSkipped,
  };
};
