import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ListRenderItemInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { MedicationCard } from "./MedicationCard";
import { Medication } from "@/types";

interface MedicationListProps {
  filteredMedications: Medication[];
  refreshing: boolean;
  handleRefresh: () => void;
  handleAddMedication: () => void;
  handleEditMedication: (medication: Medication) => void;
  handleDeleteMedication: (medication: Medication) => void;
  handleMarkTaken: (medicationId: string, scheduleId: string, name: string) => void;
  handleMarkSkipped: (
    medicationId: string,
    scheduleId: string,
    medicationName: string
  ) => Promise<void>;
  getAdherenceRate: (id: string) => number;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const MedicationList = ({
  filteredMedications,
  refreshing,
  handleRefresh,
  handleAddMedication,
  handleEditMedication,
  handleDeleteMedication,
  handleMarkTaken,
  handleMarkSkipped,
  getAdherenceRate,
  searchQuery,
  setSearchQuery,
}: MedicationListProps) => {
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={searchQuery ? "search-outline" : "medical-outline"}
        size={64}
        color={COLORS.gray.light}
      />
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No medications found" : "No medications yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No medications match "${searchQuery}"`
          : "Add your first medication to get started"}
      </Text>

      <TouchableOpacity
        style={styles.emptyButton}
        onPress={searchQuery ? () => setSearchQuery("") : handleAddMedication}
      >
        <Text style={styles.emptyButtonText}>
          {searchQuery ? "Clear Search" : "Add Medication"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: ListRenderItemInfo<Medication>) => (
    <MedicationCard
      medication={item}
      onEdit={() => handleEditMedication(item)}
      onDelete={() => handleDeleteMedication(item)}
      onMarkTaken={handleMarkTaken}
      onMarkSkipped={handleMarkSkipped}
      adherence={getAdherenceRate(item.id)}
    />
  );

  return (
    <FlatList
      data={filteredMedications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        filteredMedications.length === 0 && { flexGrow: 1, justifyContent: "center" },
      ]}
    />
  );
};

export default MedicationList;

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: DIMENSIONS.PADDING, paddingBottom: 100 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.black, marginTop: 16 },
  emptySubtitle: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
    marginTop: 8,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  emptyButtonText: { color: COLORS.white, fontSize: FONTS.size.medium, fontWeight: "600" },
});
