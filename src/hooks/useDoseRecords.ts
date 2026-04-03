import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doseRecordApi, DoseRecordResponse } from "@/services/api/doseRecordApi";
import { useAuth } from "@/contexts/AuthContext";

export const useDoseRecords = (medicationId?: string) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["doseRecords", medicationId],
    queryFn: async (): Promise<DoseRecordResponse[]> => {
      if (medicationId) {
        const response = await doseRecordApi.getHistoryByMedication(medicationId);
        return response.data.data;
      }
      const response = await doseRecordApi.getHistory();
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  const recordMutation = useMutation({
    mutationFn: async ({ scheduleId, status }: { scheduleId: string; status: "taken" | "skipped" }) => {
      const response = await doseRecordApi.record(scheduleId, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doseRecords"] });
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
  });

  return {
    records: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    recordDose: (scheduleId: string, status: "taken" | "skipped") =>
      recordMutation.mutateAsync({ scheduleId, status }),
  };
};
