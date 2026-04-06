import { useState, useMemo } from "react";
import { useMedications } from "@/hooks/useMedications";
import { useAdherence } from "@/hooks/useAdherence";
import useBehaviorAnalysis from "@/hooks/useBehaviorAnalysis";
import { getAdherenceColor, getAdherenceLabel } from "@/utils/analytics";
import { COLORS } from "@/constants/colors";

export interface PatternItem {
  label: string;
  value: string;
  color?: string;
}

export interface MedicationStat {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  rate: number;
  taken: number;
  missed: number;
  skipped: number;
  color: string;
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const getTrendColor = (trend: string): string | undefined => {
  if (trend === "improving") return COLORS.success;
  if (trend === "declining") return COLORS.error;
  return undefined;
};

export const useAdherenceAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(30);
  const [refreshing, setRefreshing] = useState(false);

  const { medications } = useMedications();
  const { getOverallStats, getMedicationStats, refetch } = useAdherence(selectedTimeframe);
  const { insights: patterns, analyzePatterns } = useBehaviorAnalysis(selectedTimeframe);

  const overallStats = getOverallStats();
  const adherenceColor = getAdherenceColor(overallStats.rate);
  const adherenceLabel = getAdherenceLabel(overallStats.rate);

  const patternItems = useMemo((): PatternItem[] | null => {
    if (!patterns) return null;
    return [
      { label: "Best Time", value: capitalize(patterns.bestTimeOfDay) },
      { label: "Challenging", value: capitalize(patterns.worstTimeOfDay) },
      { label: "Best Day", value: patterns.bestDayOfWeek },
      { label: "Trend", value: capitalize(patterns.adherenceTrend), color: getTrendColor(patterns.adherenceTrend) },
    ];
  }, [patterns]);

  const medicationStats = useMemo((): MedicationStat[] => {
    return medications.map((med) => {
      const stats = getMedicationStats(med.id);
      const rate = stats?.adherenceRate || 0;
      return {
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        unit: med.unit,
        rate,
        taken: stats?.taken || 0,
        missed: stats?.missed || 0,
        skipped: stats?.skipped || 0,
        color: getAdherenceColor(rate),
      };
    });
  }, [medications, getMedicationStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await analyzePatterns();
    setRefreshing(false);
  };

  return {
    selectedTimeframe,
    setSelectedTimeframe,
    refreshing,
    handleRefresh,
    overallStats,
    adherenceColor,
    adherenceLabel,
    patternItems,
    medicationStats,
  };
};
