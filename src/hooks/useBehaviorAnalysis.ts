import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { doseRecordApi, DoseRecordResponse } from "@/services/api/doseRecordApi";
import { useAuth } from "@/contexts/AuthContext";
import { AdherenceInsights } from "@/types";

const findOptimalTime = (records: DoseRecordResponse[]): string => {
  const slots: Record<string, { taken: number; total: number }> = {
    morning: { taken: 0, total: 0 },
    afternoon: { taken: 0, total: 0 },
    evening: { taken: 0, total: 0 },
    night: { taken: 0, total: 0 },
  };

  records.forEach((r) => {
    const hour = new Date(r.scheduledAt).getHours();
    const slot = hour >= 5 && hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
    slots[slot].total++;
    if (r.status === "taken") slots[slot].taken++;
  });

  let best = "morning";
  let bestRate = 0;
  Object.entries(slots).forEach(([slot, data]) => {
    if (data.total > 0 && data.taken / data.total > bestRate) {
      bestRate = data.taken / data.total;
      best = slot;
    }
  });
  return best;
};

const findWorstTime = (records: DoseRecordResponse[]): string => {
  const slots: Record<string, { missed: number; total: number }> = {
    morning: { missed: 0, total: 0 },
    afternoon: { missed: 0, total: 0 },
    evening: { missed: 0, total: 0 },
    night: { missed: 0, total: 0 },
  };

  records.forEach((r) => {
    const hour = new Date(r.scheduledAt).getHours();
    const slot = hour >= 5 && hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";
    slots[slot].total++;
    if (r.status === "missed") slots[slot].missed++;
  });

  let worst = "evening";
  let worstRate = 0;
  Object.entries(slots).forEach(([slot, data]) => {
    if (data.total > 0 && data.missed / data.total > worstRate) {
      worstRate = data.missed / data.total;
      worst = slot;
    }
  });
  return worst;
};

const findBestDay = (records: DoseRecordResponse[]): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const stats: Record<string, { taken: number; total: number }> = {};
  days.forEach((d) => (stats[d] = { taken: 0, total: 0 }));

  records.forEach((r) => {
    const day = days[new Date(r.scheduledAt).getDay()];
    stats[day].total++;
    if (r.status === "taken") stats[day].taken++;
  });

  let best = "Monday";
  let bestRate = 0;
  Object.entries(stats).forEach(([day, data]) => {
    if (data.total > 0 && data.taken / data.total > bestRate) {
      bestRate = data.taken / data.total;
      best = day;
    }
  });
  return best;
};

const calculateTrend = (records: DoseRecordResponse[]): "improving" | "declining" | "stable" => {
  if (records.length < 14) return "stable";
  const mid = Math.floor(records.length / 2);
  const firstRate = records.slice(0, mid).filter((r) => r.status === "taken").length / mid;
  const secondRate = records.slice(mid).filter((r) => r.status === "taken").length / (records.length - mid);
  const diff = secondRate - firstRate;
  if (diff > 0.1) return "improving";
  if (diff < -0.1) return "declining";
  return "stable";
};

const generateSuggestions = (records: DoseRecordResponse[]): string[] => {
  if (records.length === 0) return ["Start taking your medications to build good habits"];

  const suggestions: string[] = [];
  const total = records.length;
  const adherenceRate = records.filter((r) => r.status === "taken").length / total;

  const morningMisses = records.filter((r) => {
    const hour = new Date(r.scheduledAt).getHours();
    return hour >= 5 && hour < 12 && r.status === "missed";
  }).length;

  if (morningMisses > 5) {
    suggestions.push("Try placing your morning medications next to your breakfast items");
  }

  const eveningMisses = records.filter((r) => {
    const hour = new Date(r.scheduledAt).getHours();
    return hour >= 17 && hour < 21 && r.status === "missed";
  }).length;

  if (eveningMisses > 5) {
    suggestions.push("Consider setting an alarm for evening medications during dinner");
  }

  if (adherenceRate > 0.9) {
    suggestions.push("Excellent work! Keep up your consistent routine");
  }

  return suggestions.length > 0 ? suggestions : ["Continue with your current routine!"];
};

export const useBehaviorAnalysis = (timeframe: number = 30) => {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ["doseRecords", "analysis"],
    queryFn: async (): Promise<DoseRecordResponse[]> => {
      const response = await doseRecordApi.getHistory();
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  const filteredRecords = useMemo(() => {
    if (!query.data) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeframe);
    return query.data.filter((r) => new Date(r.scheduledAt) >= cutoff);
  }, [query.data, timeframe]);

  const insights = useMemo((): AdherenceInsights | null => {
    if (filteredRecords.length === 0) {
      return {
        bestTimeOfDay: "morning",
        worstTimeOfDay: "evening",
        bestDayOfWeek: "Monday",
        commonMissReasons: [],
        impactOfEvents: [],
        suggestions: ["Start taking your medications to build good habits"],
        adherenceTrend: "stable",
        improvementScore: 0,
      };
    }

    return {
      bestTimeOfDay: findOptimalTime(filteredRecords),
      worstTimeOfDay: findWorstTime(filteredRecords),
      bestDayOfWeek: findBestDay(filteredRecords),
      commonMissReasons: [],
      impactOfEvents: [],
      suggestions: generateSuggestions(filteredRecords),
      adherenceTrend: calculateTrend(filteredRecords),
      improvementScore: 0,
    };
  }, [filteredRecords]);

  const analyzePatterns = async (_timeframe: number) => {
    await query.refetch();
  };

  return {
    insights,
    error: query.error?.message || null,
    analyzePatterns,
  };
};

export default useBehaviorAnalysis;
