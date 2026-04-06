import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMedications } from "@/hooks/useMedications";
import { useAdherence } from "@/hooks/useAdherence";
import useBehaviorAnalysis from "@/hooks/useBehaviorAnalysis";
import { TimeframeSelector } from "@/components/TimeframeSelector";
import { AdherenceOverviewCard } from "@/components/AdherenceOverviewCard";
import { MedicationAdherenceCard } from "@/components/MedicationAdherenceCard";
import { getAdherenceColor, getAdherenceLabel } from "@/utils/analytics";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS as DIMS, FONTS } from "@/constants/theme";

export const AdherenceAnalyticsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(30);

  const { medications } = useMedications();
  const { getOverallStats, getMedicationStats, refetch } = useAdherence(selectedTimeframe);
  const { insights: patterns, analyzePatterns } = useBehaviorAnalysis(selectedTimeframe);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await analyzePatterns();
    setRefreshing(false);
  };

  const overallStats = getOverallStats();
  const adherenceColor = getAdherenceColor(overallStats.rate);
  const adherenceLabel = getAdherenceLabel(overallStats.rate);

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

        {/* Patterns */}
        {patterns && (
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.sectionIconBg, { backgroundColor: COLORS.tint.purple }]}>
                  <Ionicons name="analytics" size={16} color={COLORS.primaryDark} />
                </View>
                <Text style={styles.cardTitle}>Patterns</Text>
              </View>

              <View style={styles.patternGrid}>
                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Best Time</Text>
                  <Text style={styles.patternValue}>
                    {patterns.bestTimeOfDay.charAt(0).toUpperCase() + patterns.bestTimeOfDay.slice(1)}
                  </Text>
                </View>
                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Challenging</Text>
                  <Text style={styles.patternValue}>
                    {patterns.worstTimeOfDay.charAt(0).toUpperCase() + patterns.worstTimeOfDay.slice(1)}
                  </Text>
                </View>
                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Best Day</Text>
                  <Text style={styles.patternValue}>{patterns.bestDayOfWeek}</Text>
                </View>
                <View style={styles.patternItem}>
                  <Text style={styles.patternLabel}>Trend</Text>
                  <Text
                    style={[
                      styles.patternValue,
                      {
                        color:
                          patterns.adherenceTrend === "improving"
                            ? COLORS.success
                            : patterns.adherenceTrend === "declining"
                              ? COLORS.error
                              : COLORS.gray.dark,
                      },
                    ]}
                  >
                    {patterns.adherenceTrend.charAt(0).toUpperCase() + patterns.adherenceTrend.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* By Medication */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBg, { backgroundColor: COLORS.tint.pink }]}>
            <Ionicons name="medical" size={16} color={COLORS.primaryDark} />
          </View>
          <Text style={styles.sectionTitle}>By Medication</Text>
        </View>

        <View style={styles.section}>
          {medications.map((medication) => {
            const medStats = getMedicationStats(medication.id);
            const medRate = medStats?.adherenceRate || 0;

            return (
              <MedicationAdherenceCard
                key={medication.id}
                name={medication.name}
                dosage={medication.dosage}
                unit={medication.unit}
                rate={medRate}
                taken={medStats?.taken || 0}
                missed={medStats?.missed || 0}
                skipped={medStats?.skipped || 0}
                color={getAdherenceColor(medRate)}
              />
            );
          })}
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

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
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

  // Patterns
  patternGrid: { flexDirection: "row", flexWrap: "wrap" },
  patternItem: { width: "50%", paddingVertical: 10, alignItems: "center" },
  patternLabel: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium, marginBottom: 4 },
  patternValue: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
});
