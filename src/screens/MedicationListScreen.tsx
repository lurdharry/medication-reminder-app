import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useMedicationContext } from "../contexts/MedicationContext";
import medicationService from "../services/medicationService";
import { useVoice } from "../hooks/useVoice";

import { Medication } from "../types";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import MedicationList from "@/components/MedicationList";

export const MedicationListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { medications, deleteMedication, getAdherenceRate, refreshMedications } =
    useMedicationContext();
  const { speak } = useVoice();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "time" | "adherence">("time");

  useEffect(() => {
    announceScreen();
  }, []);

  const announceScreen = async () => {
    const count = medications.length;
    const pendingCount = getTodaysPendingCount();
    await speak(
      `You have ${count} medication${count !== 1 ? "s" : ""} in your list. ${pendingCount} dose${
        pendingCount !== 1 ? "s" : ""
      } remaining today.`
    );
  };

  const getTodaysPendingCount = (): number => {
    return medications.reduce((count, med) => {
      return count + med.schedule.filter((s) => !s.taken && !s.skipped).length;
    }, 0);
  };

  const handleAddMedication = () => {
    navigation.navigate("AddMedication" as never);
  };

  const handleEditMedication = (medication: Medication) => {
    navigation.navigate("AddMedication" as never, { medicationId: medication.id } as never);
  };

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

  const handleMarkTaken = async (
    medicationId: string,
    scheduleId: string,
    medicationName: string
  ) => {
    await medicationService.markDoseTaken(medicationId, scheduleId);
    await speak(`${medicationName} marked as taken`);
    await refreshMedications();
  };

  const handleMarkSkipped = async (
    medicationId: string,
    scheduleId: string,
    medicationName: string
  ) => {
    Alert.alert("Skip Dose", `Skip ${medicationName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Skip",
        style: "destructive",
        onPress: async () => {
          await medicationService.markDoseSkipped(medicationId, scheduleId);
          await speak(`${medicationName} marked as skipped`);
          await refreshMedications();
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMedications();
    setRefreshing(false);
  };

  const getFilteredMedications = (): Medication[] => {
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
          const aTime = a.schedule[0]?.time || "99:99";
          const bTime = b.schedule[0]?.time || "99:99";
          return aTime.localeCompare(bTime);
        case "adherence":
          return (b.adherenceRate || 0) - (a.adherenceRate || 0);
        default:
          return 0;
      }
    });
  };

  const filteredMedications = getFilteredMedications();
  const overallAdherence = getAdherenceRate();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Medications</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMedication}
          accessibilityLabel="Add new medication"
        >
          <Ionicons name="add-circle" size={32} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {medications.length > 0 && (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{medications.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{overallAdherence}%</Text>
              <Text style={styles.statLabel}>Adherence</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{getTodaysPendingCount()}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray.medium} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medications..."
              value={searchQuery}
              onChangeText={(e) => setSearchQuery(e)}
            />
          </View>

          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(["time", "name", "adherence"] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
                  onPress={() => setSortBy(option)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortBy === option && styles.sortButtonTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}

      <MedicationList
        filteredMedications={filteredMedications}
        refreshing={refreshing}
        handleRefresh={handleRefresh}
        handleAddMedication={handleAddMedication}
        handleEditMedication={handleEditMedication}
        handleDeleteMedication={handleDeleteMedication}
        handleMarkTaken={handleMarkTaken}
        handleMarkSkipped={handleMarkSkipped}
        getAdherenceRate={getAdherenceRate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 16,
  },
  title: { fontSize: FONTS.size.huge, fontWeight: "bold", color: COLORS.black },
  addButton: { padding: 8 },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.primary + "15",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: { fontSize: FONTS.size.extraLarge, fontWeight: "bold", color: COLORS.primary },
  statLabel: { fontSize: FONTS.size.medium, color: COLORS.gray.dark, marginTop: 4 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.gray.lightest,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.size.medium,

    backgroundColor: "transparent",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
  },
  sortLabel: { fontSize: FONTS.size.medium, color: COLORS.gray.dark, marginRight: 12 },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray.light,
    marginRight: 8,
  },
  sortButtonActive: { backgroundColor: COLORS.primary },
  sortButtonText: { fontSize: FONTS.size.medium, color: COLORS.gray.dark },
  sortButtonTextActive: { color: COLORS.white, fontWeight: "600" },
});
