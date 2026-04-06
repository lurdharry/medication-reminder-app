import { useState, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useMedications } from "@/hooks/useMedications";
import { useAdherence } from "@/hooks/useAdherence";
import { useVoice } from "@/hooks/useVoice";
import { Medication } from "@/types";

export const useMedicationList = () => {
  const navigation = useAppNavigation();
  const { medications, deleteMedication, markDoseTaken, markDoseSkipped, refetch } =
    useMedications();
  const { getOverallStats } = useAdherence();
  const { speak } = useVoice();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "time" | "adherence">("time");

  useEffect(() => {
    const count = medications.length;
    const pendingCount = medications.reduce(
      (acc, med) => acc + med.schedule.filter((s) => !s.taken && !s.skipped).length,
      0
    );
    speak(
      `You have ${count} medication${count !== 1 ? "s" : ""}. ${pendingCount} dose${
        pendingCount !== 1 ? "s" : ""
      } remaining today.`
    );
  }, []);

  const overallStats = getOverallStats();

  const pendingCount = useMemo(
    () =>
      medications.reduce(
        (acc, med) => acc + med.schedule.filter((s) => !s.taken && !s.skipped).length,
        0
      ),
    [medications]
  );

  const filteredMedications = useMemo(() => {
    let filtered = medications;

    if (searchQuery) {
      filtered = filtered.filter(
        (med) =>
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "time":
          return (a.schedule[0]?.time || "99:99").localeCompare(b.schedule[0]?.time || "99:99");
        case "adherence":
          return (b.adherenceRate || 0) - (a.adherenceRate || 0);
        default:
          return 0;
      }
    });
  }, [medications, searchQuery, sortBy]);

  const handleAddMedication = () => navigation.navigate("AddMedication");

  const handleEditMedication = (medication: Medication) =>
    navigation.navigate("AddMedication", { medicationId: medication.id });

  const handleDeleteMedication = (medication: Medication) => {
    Alert.alert("Delete Medication", `Are you sure you want to delete ${medication.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMedication(medication.id);
          await speak(`${medication.name} has been deleted`);
        },
      },
    ]);
  };

  const handleMarkTaken = async (_medicationId: string, scheduleId: string, medicationName: string) => {
    await markDoseTaken(scheduleId);
    await speak(`${medicationName} marked as taken`);
  };

  const handleMarkSkipped = async (_medicationId: string, scheduleId: string, medicationName: string) => {
    Alert.alert("Skip Dose", `Skip ${medicationName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Skip",
        style: "destructive",
        onPress: async () => {
          await markDoseSkipped(scheduleId);
          await speak(`${medicationName} marked as skipped`);
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return {
    medications,
    filteredMedications,
    overallStats,
    pendingCount,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    refreshing,
    handleRefresh,
    handleAddMedication,
    handleEditMedication,
    handleDeleteMedication,
    handleMarkTaken,
    handleMarkSkipped,
  };
};
