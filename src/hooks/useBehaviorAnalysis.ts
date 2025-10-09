import { useState, useCallback, useEffect } from "react";

import { DoseRecord, AdherenceInsights } from "../types";
import { STORAGE_KEYS } from "@/constants/storage";
import { Storage } from "@/services/storage";

/**
 * Hook for analyzing medication adherence behavior patterns
 */
export const useBehaviorAnalysis = (userId?: string) => {
  const [insights, setInsights] = useState<AdherenceInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyzePatterns(30);
  }, []);

  /**
   * Get dose records for a specific time period
   */
  const getDoseRecordsForPeriod = useCallback((days: number): DoseRecord[] => {
    const allRecords = Storage.getObject<DoseRecord[]>(STORAGE_KEYS.DOSE_RECORDS) || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return allRecords.filter((record) => new Date(record.scheduledTime) >= cutoffDate);
  }, []);

  /**
   * Find optimal times when user is most adherent
   */
  const findOptimalTimes = useCallback((records: DoseRecord[]): string => {
    const timeSlots = {
      morning: { taken: 0, total: 0 },
      afternoon: { taken: 0, total: 0 },
      evening: { taken: 0, total: 0 },
      night: { taken: 0, total: 0 },
    };

    records.forEach((record) => {
      const hour = new Date(record.scheduledTime).getHours();
      let slot: keyof typeof timeSlots;

      if (hour >= 5 && hour < 12) slot = "morning";
      else if (hour >= 12 && hour < 17) slot = "afternoon";
      else if (hour >= 17 && hour < 21) slot = "evening";
      else slot = "night";

      timeSlots[slot].total++;
      if (record.status === "taken") {
        timeSlots[slot].taken++;
      }
    });

    let bestSlot = "morning";
    let bestRate = 0;

    Object.entries(timeSlots).forEach(([slot, data]) => {
      if (data.total > 0) {
        const rate = data.taken / data.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestSlot = slot;
        }
      }
    });

    return bestSlot;
  }, []);

  /**
   * Find problematic times when user often misses doses
   */
  const findProblematicTimes = useCallback((records: DoseRecord[]): string => {
    const timeSlots = {
      morning: { missed: 0, total: 0 },
      afternoon: { missed: 0, total: 0 },
      evening: { missed: 0, total: 0 },
      night: { missed: 0, total: 0 },
    };

    records.forEach((record) => {
      const hour = new Date(record.scheduledTime).getHours();
      let slot: keyof typeof timeSlots;

      if (hour >= 5 && hour < 12) slot = "morning";
      else if (hour >= 12 && hour < 17) slot = "afternoon";
      else if (hour >= 17 && hour < 21) slot = "evening";
      else slot = "night";

      timeSlots[slot].total++;
      if (record.status === "missed") {
        timeSlots[slot].missed++;
      }
    });

    let worstSlot = "morning";
    let worstRate = 0;

    Object.entries(timeSlots).forEach(([slot, data]) => {
      if (data.total > 0) {
        const rate = data.missed / data.total;
        if (rate > worstRate) {
          worstRate = rate;
          worstSlot = slot;
        }
      }
    });

    return worstSlot;
  }, []);

  /**
   * Analyze which day of week has best adherence
   */
  const analyzeDayPatterns = useCallback((records: DoseRecord[]): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayStats: Record<string, { taken: number; total: number }> = {};

    days.forEach((day) => {
      dayStats[day] = { taken: 0, total: 0 };
    });

    records.forEach((record) => {
      const dayName = days[new Date(record.scheduledTime).getDay()];
      dayStats[dayName].total++;
      if (record.status === "taken") {
        dayStats[dayName].taken++;
      }
    });

    let bestDay = "Monday";
    let bestRate = 0;

    Object.entries(dayStats).forEach(([day, stats]) => {
      if (stats.total > 0) {
        const rate = stats.taken / stats.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestDay = day;
        }
      }
    });

    return bestDay;
  }, []);

  /**
   * Generate personalized suggestions
   */
  const generateSuggestions = useCallback((records: DoseRecord[]): string[] => {
    const suggestions: string[] = [];

    const morningMisses = records.filter((r) => {
      const hour = new Date(r.scheduledTime).getHours();
      return hour >= 5 && hour < 12 && r.status === "missed";
    }).length;

    if (morningMisses > 5) {
      suggestions.push("Try placing your morning medications next to your breakfast items");
    }

    const eveningMisses = records.filter((r) => {
      const hour = new Date(r.scheduledTime).getHours();
      return hour >= 17 && hour < 21 && r.status === "missed";
    }).length;

    if (eveningMisses > 5) {
      suggestions.push("Consider setting an alarm for evening medications during dinner");
    }

    const weekendMisses = records.filter((r) => {
      const day = new Date(r.scheduledTime).getDay();
      return (day === 0 || day === 6) && r.status === "missed";
    }).length;

    if (weekendMisses > records.length * 0.3) {
      suggestions.push("You tend to miss more doses on weekends. Try weekend-specific reminders");
    }

    const adherenceRate = records.filter((r) => r.status === "taken").length / records.length;
    if (adherenceRate > 0.9) {
      suggestions.push("Excellent work! Keep up your consistent routine");
    }

    return suggestions.length > 0 ? suggestions : ["Continue with your current routine!"];
  }, []);

  /**
   * Calculate adherence trend
   */
  const calculateTrend = useCallback(
    (records: DoseRecord[]): "improving" | "declining" | "stable" => {
      if (records.length < 14) return "stable";

      const midPoint = Math.floor(records.length / 2);
      const firstHalf = records.slice(0, midPoint);
      const secondHalf = records.slice(midPoint);

      const firstRate = firstHalf.filter((r) => r.status === "taken").length / firstHalf.length;
      const secondRate = secondHalf.filter((r) => r.status === "taken").length / secondHalf.length;

      const difference = secondRate - firstRate;

      if (difference > 0.1) return "improving";
      if (difference < -0.1) return "declining";
      return "stable";
    },
    []
  );

  /**
   * Calculate improvement score
   */
  const calculateImprovement = useCallback((records: DoseRecord[]): number => {
    if (records.length < 14) return 0;

    const weekAgoIndex = Math.max(0, records.length - 7);
    const recentWeek = records.slice(weekAgoIndex);
    const previousWeek = records.slice(Math.max(0, weekAgoIndex - 7), weekAgoIndex);

    if (previousWeek.length === 0) return 0;

    const recentRate = recentWeek.filter((r) => r.status === "taken").length / recentWeek.length;
    const previousRate =
      previousWeek.filter((r) => r.status === "taken").length / previousWeek.length;

    return Math.round((recentRate - previousRate) * 100);
  }, []);

  /**
   * Main analysis function
   */
  const analyzePatterns = useCallback(
    async (timeframe: number = 30) => {
      setError(null);

      try {
        const records = getDoseRecordsForPeriod(timeframe);

        if (records.length === 0) {
          setInsights({
            bestTimeOfDay: "morning",
            worstTimeOfDay: "evening",
            bestDayOfWeek: "Monday",
            commonMissReasons: [],
            impactOfEvents: [],
            suggestions: ["Start taking your medications to build good habits"],
            adherenceTrend: "stable",
            improvementScore: 0,
          });

          return;
        }

        const analysisResult: AdherenceInsights = {
          bestTimeOfDay: findOptimalTimes(records),
          worstTimeOfDay: findProblematicTimes(records),
          bestDayOfWeek: analyzeDayPatterns(records),
          commonMissReasons: [],
          impactOfEvents: [],
          suggestions: generateSuggestions(records),
          adherenceTrend: calculateTrend(records),
          improvementScore: calculateImprovement(records),
        };

        setInsights(analysisResult);
      } catch (err) {
        setError("Failed to analyze behavior patterns");
        console.error("Behavior analysis error:", err);
      }
    },
    [
      getDoseRecordsForPeriod,
      findOptimalTimes,
      findProblematicTimes,
      analyzeDayPatterns,
      generateSuggestions,
      calculateTrend,
      calculateImprovement,
    ]
  );

  return {
    insights,

    error,
    analyzePatterns,
  };
};

export default useBehaviorAnalysis;
