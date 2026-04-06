import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import MedicationList from "@/components/MedicationList";
import { useMedicationList } from "./useMedicationList";

export const MedicationListScreen: React.FC = () => {
  const {
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
  } = useMedicationList();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Medications</Text>
        <Pressable style={styles.addButton} onPress={handleAddMedication}>
          <Ionicons name="add-circle" size={32} color={COLORS.primary} />
        </Pressable>
      </View>

      {medications.length > 0 && (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{medications.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{overallStats.rate}%</Text>
              <Text style={styles.statLabel}>Adherence</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray.medium} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medications..."
              placeholderTextColor={COLORS.gray.light}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(["time", "name", "adherence"] as const).map((option) => (
                <Pressable
                  key={option}
                  style={[styles.sortButton, sortBy === option && styles.sortButtonActive]}
                  onPress={() => setSortBy(option)}
                >
                  <Text
                    style={[styles.sortButtonText, sortBy === option && styles.sortButtonTextActive]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </Pressable>
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
        getAdherenceRate={() => overallStats.rate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 16,
  },
  title: { fontSize: 26, fontWeight: "700", color: COLORS.primaryDark },
  addButton: { padding: 8 },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  statValue: { fontSize: FONTS.size.extraLarge, fontWeight: "bold", color: COLORS.primaryDark },
  statLabel: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 4 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.size.medium,
    color: COLORS.primaryDark,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
  },
  sortLabel: { fontSize: FONTS.size.medium, color: COLORS.gray.medium, marginRight: 12 },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray.lightest,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortButtonText: { fontSize: FONTS.size.medium, color: COLORS.gray.medium },
  sortButtonTextActive: { color: COLORS.white, fontWeight: "600" },
});
