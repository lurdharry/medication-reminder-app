import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "@/constants/colors";
import { useMedicationContext } from "@/contexts/MedicationContext";
import { useVoice } from "@/hooks/useVoice";
import medicationService from "./medicationService";
import { Medication, MedicationSchedule } from "@/types";
import { getGreeting } from "@/utils/helpers";

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

export const useHomeScreen = () => {
  const navigation = useNavigation();
  const { medications, deleteMedication, getAdherenceRate, refreshMedications, user } =
    useMedicationContext();
  const { speak } = useVoice();

  const [refreshing, setRefreshing] = useState(false);
  const [pendingDoses, setPendingDoses] = useState<
    Array<{ medication: Medication; schedule: MedicationSchedule }>
  >([]);

  useEffect(() => {
    loadDashboard();
  }, [medications]);

  const overallAdherence = getAdherenceRate();

  const loadDashboard = async () => {
    const pending = medicationService.getPendingDoses();
    setPendingDoses(pending);

    const greeting = getGreeting();
    const userName = user?.name || "there";
    const pendingCount = pending.length;

    if (pendingCount > 0) {
      await speak(
        `${greeting}, ${userName}. You have ${pendingCount} pending dose${
          pendingCount !== 1 ? "s" : ""
        }.`
      );
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMedications();
    await loadDashboard();
    setRefreshing(false);
  };

  const handleMarkTaken = async (
    medicationId: string,
    scheduleId: string,
    medicationName: string
  ) => {
    await medicationService.markDoseTaken(medicationId, scheduleId);
    await speak(`${medicationName} marked as taken. Great job!`);
    await loadDashboard();
  };

  const handleMarkSkipped = async (medicationId: string, scheduleId: string) => {
    await medicationService.markDoseSkipped(medicationId, scheduleId);
    await loadDashboard();
  };

  const handleViewAllMedications = () => {
    navigation.navigate("Medications" as never);
  };

  const handleViewAnalytics = () => {
    navigation.navigate("Analytics" as never);
  };

  const quickActions: ActionItem[] = [
    {
      id: "add",
      label: "Add Medication",
      icon: "add-circle",
      onPress: () => navigation.navigate("AddMedication" as never),
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
      onPress: () => navigation.navigate("Settings" as never),
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
        title: overallAdherence + "%",
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
    [medications, overallAdherence, pendingDoses]
  );

  const upcomingDoses = useMemo(() => medicationService.getUpcomingDoses().slice(0, 3), []);

  return {
    handleMarkSkipped,
    handleMarkTaken,
    quickActions,
    handleViewAllMedications,
    handleViewAnalytics,
    quickStats,
    handleRefresh,
    loadDashboard,
    refreshing,
    pendingDoses,
    userName: user?.name,
    upcomingDoses,
  };
};
