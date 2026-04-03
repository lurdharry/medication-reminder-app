import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { medicationApi, MedicationResponse } from "@/services/api/medicationApi";
import { doseScheduleApi, DoseScheduleResponse } from "@/services/api/doseScheduleApi";
import { doseRecordApi, DoseRecordResponse } from "@/services/api/doseRecordApi";
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
  schedules: DoseScheduleResponse[],
  todayRecords: DoseRecordResponse[]
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
  schedule: schedules.map((s) => {
    const record = todayRecords.find((r) => r.doseScheduleId === s.id);
    return {
      id: s.id,
      time: s.time.substring(0, 5),
      taken: record?.status === "taken",
      skipped: record?.status === "skipped" || record?.status === "missed",
    };
  }),
});

const fetchMedicationsWithSchedules = async (): Promise<Medication[]> => {
  const [medsResponse, recordsResponse] = await Promise.all([
    medicationApi.getAll(),
    doseRecordApi.getHistory(),
  ]);

  const meds = medsResponse.data.data;
  const todayRecords = recordsResponse.data.data.filter((r) => {
    const recordDate = r.scheduledAt?.split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    return recordDate === today;
  });

  return Promise.all(
    meds.map(async (med) => {
      const schedulesResponse = await doseScheduleApi.getAll(med.id);
      const medRecords = todayRecords.filter((r) => r.medicationId === med.id);
      return mapToMedication(med, schedulesResponse.data.data, medRecords);
    })
  );
};

export const useMedications = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["medications"],
    queryFn: fetchMedicationsWithSchedules,
    enabled: isAuthenticated,
  });

  const addMutation = useMutation({
    mutationFn: async (input: MedicationInput) => {
      const response = await medicationApi.add({
        name: input.name,
        dosage: input.dosage,
        unit: input.unit,
        purpose: input.purpose,
        instruction: input.instructions,
        startDate: input.startDate ? format(input.startDate, "yyyy-MM-dd") : undefined,
        endDate: input.endDate ? format(input.endDate, "yyyy-MM-dd") : undefined,
        refillDate: input.refillDate ? format(input.refillDate, "yyyy-MM-dd") : undefined,
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
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<MedicationInput> }) => {
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
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await medicationApi.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });

  const markTakenMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      await doseRecordApi.record(scheduleId, { status: "taken" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
    },
  });

  const markSkippedMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      await doseRecordApi.record(scheduleId, { status: "skipped" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
    },
  });

  const getMedicationById = (id: string): Medication | null => {
    return query.data?.find((m) => m.id === id) || null;
  };

  return {
    medications: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    addMedication: addMutation.mutateAsync,
    updateMedication: (id: string, input: Partial<MedicationInput>) =>
      updateMutation.mutateAsync({ id, input }),
    deleteMedication: deleteMutation.mutateAsync,
    getMedicationById,
    markDoseTaken: markTakenMutation.mutateAsync,
    markDoseSkipped: markSkippedMutation.mutateAsync,
  };
};
