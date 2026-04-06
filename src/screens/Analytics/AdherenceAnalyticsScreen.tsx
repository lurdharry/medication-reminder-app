import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMedications } from "@/hooks/useMedications";
import { useAdherence } from "@/hooks/useAdherence";
import { useBehaviorAnalysis } from "../hooks/useBehaviorAnalysis";
import { ADHERENCE_THRESHOLDS } from "@/constants";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS as DIMS, FONTS } from "@/constants/theme";

export const AdherenceAnalyticsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<7 | 30 | 90>(30);

  const { medications } = useMedications();
  const { getOverallStats, getMedicationStats, refetch } = useAdherence(selectedTimeframe);
  const { insights: patterns, analyzePatterns } = useBehaviorAnalysis(selectedTimeframe);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await analyzePatterns();
    setRefreshing(false);
  };

  const getAdherenceColor = (rate: number): string => {
    if (rate >= ADHERENCE_THRESHOLDS.EXCELLENT) return COLORS.success;
    if (rate >= ADHERENCE_THRESHOLDS.GOOD) return COLORS.primary;
    if (rate >= ADHERENCE_THRESHOLDS.FAIR) return COLORS.warning;
    return COLORS.error;
  };

  const getAdherenceLabel = (rate: number): string => {
    if (rate >= ADHERENCE_THRESHOLDS.EXCELLENT) return "Excellent";
    if (rate >= ADHERENCE_THRESHOLDS.GOOD) return "Good";
    if (rate >= ADHERENCE_THRESHOLDS.FAIR) return "Fair";
    if (rate >= ADHERENCE_THRESHOLDS.POOR) return "Poor";
    return "Critical";
  };

  const overallStats = getOverallStats();
  const overallRate = overallStats.rate;
  const adherenceColor = getAdherenceColor(overallRate);
  const adherenceLabel = getAdherenceLabel(overallRate);

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

        {/* Timeframe */}
        <View style={styles.timeframeContainer}>
          {([7, 30, 90] as const).map((days) => (
            <Pressable
              key={days}
              style={[
                styles.timeframeButton,
                selectedTimeframe === days && styles.timeframeButtonActive,
              ]}
              onPress={() => setSelectedTimeframe(days)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  selectedTimeframe === days && styles.timeframeTextActive,
                ]}
              >
                {days === 7 ? "Week" : days === 30 ? "Month" : "3 Months"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Overall */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Overall Adherence</Text>
            <View style={[styles.badge, { backgroundColor: adherenceColor + "15" }]}>
              <Text style={[styles.badgeText, { color: adherenceColor }]}>
                {adherenceLabel}
              </Text>
            </View>
          </View>

          <View style={styles.rateSection}>
            <Text style={[styles.rateText, { color: adherenceColor }]}>{overallRate}%</Text>
            <Text style={styles.rateLabel}>Adherence Rate</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.tint.green }]}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              </View>
              <Text style={styles.statValue}>{overallStats.taken}</Text>
              <Text style={styles.statLabel}>Taken</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.error + "12" }]}>
                <Ionicons name="close-circle" size={18} color={COLORS.error} />
              </View>
              <Text style={styles.statValue}>{overallStats.missed}</Text>
              <Text style={styles.statLabel}>Missed</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.tint.peach }]}>
                <Ionicons name="remove-circle" size={18} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>{overallStats.skipped}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
          </View>

          {overallStats.streak > 0 && (
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={18} color={COLORS.warning} />
              <Text style={styles.streakText}>{overallStats.streak} day streak!</Text>
            </View>
          )}
        </View>

        {/* Patterns */}
        {patterns && (
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
                <Text style={[
                  styles.patternValue,
                  { color: patterns.adherenceTrend === "improving" ? COLORS.success : patterns.adherenceTrend === "declining" ? COLORS.error : COLORS.gray.dark },
                ]}>
                  {patterns.adherenceTrend.charAt(0).toUpperCase() + patterns.adherenceTrend.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* By Medication */}
        <View style={styles.sectionRow}>
          <View style={[styles.sectionIconBg, { backgroundColor: COLORS.tint.pink }]}>
            <Ionicons name="medical" size={16} color={COLORS.primaryDark} />
          </View>
          <Text style={styles.sectionTitle}>By Medication</Text>
        </View>

        {medications.map((medication) => {
          const medStats = getMedicationStats(medication.id);
          const medRate = medStats?.adherenceRate || 0;
          const medColor = getAdherenceColor(medRate);

          return (
            <View key={medication.id} style={styles.medCard}>
              <View style={styles.medHeader}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{medication.name}</Text>
                  <Text style={styles.medDosage}>{medication.dosage}{medication.unit}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: medColor + "15" }]}>
                  <Text style={[styles.badgeText, { color: medColor }]}>{medRate}%</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${medRate}%`, backgroundColor: medColor }]}
                />
              </View>

              <View style={styles.medStatsRow}>
                {[
                  { stat: medStats?.taken || 0, label: "Taken" },
                  { stat: medStats?.missed || 0, label: "Missed" },
                  { stat: medStats?.skipped || 0, label: "Skipped" },
                ].map((item) => (
                  <View style={styles.medStatItem} key={item.label}>
                    <Text style={styles.medStatValue}>{item.stat}</Text>
                    <Text style={styles.medStatLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
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

  // Timeframe
  timeframeContainer: {
    flexDirection: "row",
    paddingHorizontal: DIMS.PADDING,
    marginBottom: 20,
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.gray.lightest,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    alignItems: "center",
  },
  timeframeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeframeText: { fontSize: FONTS.size.small, color: COLORS.gray.medium, fontWeight: "500" },
  timeframeTextActive: { color: COLORS.white, fontWeight: "600" },

  // Cards
  card: {
    marginHorizontal: DIMS.PADDING,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark, flex: 1 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: FONTS.size.small, fontWeight: "600" },

  // Rate
  rateSection: { alignItems: "center", marginBottom: 20 },
  rateText: { fontSize: 44, fontWeight: "700" },
  rateLabel: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 4 },

  // Stats
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 6 },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.primaryDark },
  statLabel: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium },

  // Streak
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.tint.peach,
    borderRadius: 10,
    gap: 6,
  },
  streakText: { fontSize: FONTS.size.small, fontWeight: "600", color: COLORS.warning },

  // Section
  sectionIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DIMS.PADDING,
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },

  // Patterns
  patternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  patternItem: {
    width: "50%",
    paddingVertical: 10,
    alignItems: "center",
  },
  patternLabel: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium, marginBottom: 4 },
  patternValue: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },

  // Medication Cards
  medCard: {
    marginHorizontal: DIMS.PADDING,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  medHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  medInfo: { flex: 1 },
  medName: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
  medDosage: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 2 },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray.lightest,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  medStatsRow: { flexDirection: "row", justifyContent: "space-around" },
  medStatItem: { alignItems: "center" },
  medStatValue: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
  medStatLabel: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium, marginTop: 2 },
});
