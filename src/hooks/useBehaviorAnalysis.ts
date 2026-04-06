import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

import { analyticsApi, PatternResponse } from "@/services/api/analyticsApi";

export const useBehaviorAnalysis = (timeframe: number = 30) => {
  const { isAuthenticated } = useAuth();

  const { data, refetch, error } = useQuery({
    queryKey: ["patterns", timeframe],
    queryFn: async (): Promise<PatternResponse> => {
      const response = await analyticsApi.getPatterns(timeframe);
      return response.data.data;
    },
    enabled: isAuthenticated && !!timeframe,
  });

  const analyzePatterns = async () => {
    await refetch();
  };

  return {
    insights: data || null,
    error: error?.message || null,
    analyzePatterns,
  };
};

export default useBehaviorAnalysis;
