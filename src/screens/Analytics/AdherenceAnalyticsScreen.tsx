import React from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TimeframeSelector } from "@/components/TimeframeSelector";
import { AdherenceOverviewCard } from "@/components/AdherenceOverviewCard";
import { MedicationAdherenceCard } from "@/components/MedicationAdherenceCard";
import { PatternsCard } from "@/components/PatternsCard";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS as DIMS, FONTS } from "@/constants/theme";
import { useAdherenceAnalytics } from "./useAdherenceAnalytics";

export const AdherenceAnalyticsScreen: React.FC = () => {
  const {
    selectedTimeframe,
    setSelectedTimeframe,
    refreshing,
    handleRefresh,
    overallStats,
    adherenceColor,
    adherenceLabel,
    patternItems,
    medicationStats,
  } = useAdherenceAnalytics();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>

        <View style={styles.section}>
          <TimeframeSelector selected={selectedTimeframe} onSelect={setSelectedTimeframe} />
        </View>

        <View style={styles.section}>
          <AdherenceOverviewCard
            stats={overallStats}
            adherenceColor={adherenceColor}
            adherenceLabel={adherenceLabel}
          />
        </View>

        {patternItems && (
          <View style={styles.section}>
            <PatternsCard items={patternItems} />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBg, { backgroundColor: COLORS.tint.pink }]}>
            <Ionicons name="medical" size={16} color={COLORS.primaryDark} />
          </View>
          <Text style={styles.sectionTitle}>By Medication</Text>
        </View>

        <View style={styles.section}>
          {medicationStats.map((med) => (
            <MedicationAdherenceCard
              key={med.id}
              name={med.name}
              dosage={med.dosage}
              unit={med.unit}
              rate={med.rate}
              taken={med.taken}
              missed={med.missed}
              skipped={med.skipped}
              color={med.color}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: DIMS.PADDING, paddingVertical: 20 },
  title: { fontSize: 26, fontWeight: "700", color: COLORS.primaryDark },
  section: { paddingHorizontal: DIMS.PADDING, marginBottom: 16 },
  sectionIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DIMS.PADDING,
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
});
