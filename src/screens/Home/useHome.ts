import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { COLORS } from "@/constants/colors";
import { useMedications } from "@/hooks/useMedications";
import { useAdherence } from "@/hooks/useAdherence";
import { useAuth } from "@/contexts/AuthContext";
import { useVoice } from "@/hooks/useVoice";

interface ActionItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

interface QuickStatItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string | number;
  subTitle: string;
  color: string;
}

export const useHome = () => {
  const navigation = useAppNavigation();
  const { medications, refetch, markDoseTaken, markDoseSkipped } = useMedications();
  const { getOverallStats } = useAdherence();
  const { user } = useAuth();
  const { speak } = useVoice();

  const [refreshing, setRefreshing] = useState(false);

  const overallStats = getOverallStats();

  const { pendingDoses, upcomingDoses } = useMemo(() => {
    const currentTime = format(new Date(), "HH:mm");

    const allDoses = medications.flatMap((med) =>
      med.schedule
        .filter((s) => !s.taken && !s.skipped)
        .map((schedule) => ({ medication: med, schedule }))
    );

    const pending = allDoses.filter((d) => d.schedule.time <= currentTime);
    const upcoming = allDoses
      .filter((d) => d.schedule.time > currentTime)
      .sort((a, b) => a.schedule.time.localeCompare(b.schedule.time))
      .slice(0, 3);

    return { pendingDoses: pending, upcomingDoses: upcoming };
  }, [medications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkTaken = async (
    _medicationId: string,
    scheduleId: string,
    medicationName: string
  ) => {
    await markDoseTaken(scheduleId);
    await speak(`${medicationName} marked as taken. Great job!`);
  };

  const handleMarkSkipped = async (_medicationId: string, scheduleId: string) => {
    await markDoseSkipped(scheduleId);
  };

  const handleViewAllMedications = () => {
    navigation.navigate("Medications");
  };

  const handleViewAnalytics = () => {
    navigation.navigate("Analytics");
  };

  const quickActions: ActionItem[] = [
    {
      id: "add",
      label: "Add Medication",
      icon: "add-circle",
      onPress: () => navigation.navigate("AddMedication"),
    },
    {
      id: "list",
      label: "All Medications",
      icon: "list",
      onPress: handleViewAllMedications,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: "analytics",
      onPress: handleViewAnalytics,
    },
    {
      id: "settings",
      label: "Settings",
      icon: "settings",
      onPress: () => navigation.navigate("Settings"),
    },
  ];

  const quickStats = useMemo(
    (): QuickStatItem[] => [
      {
        icon: "medical",
        title: medications.length,
        subTitle: "Medications",
        color: COLORS.primary,
      },
      {
        icon: "checkmark-done",
        title: overallStats.rate + "%",
        subTitle: "Adherence",
        color: COLORS.success,
      },
      {
        icon: "timer",
        title: pendingDoses.length,
        subTitle: "Pending",
        color: COLORS.warning,
      },
    ],
    [medications, overallStats.rate, pendingDoses]
  );

  return {
    handleMarkSkipped,
    handleMarkTaken,
    quickActions,
    handleViewAllMedications,
    handleViewAnalytics,
    quickStats,
    handleRefresh,
    refreshing,
    pendingDoses,
    userName: user?.name,
    upcomingDoses,
  };
};
