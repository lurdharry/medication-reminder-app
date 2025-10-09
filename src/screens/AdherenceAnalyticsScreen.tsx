import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMedicationContext } from "../contexts/MedicationContext";
import { useBehaviorAnalysis } from "../hooks/useBehaviorAnalysis";
import { ADHERENCE_THRESHOLDS } from "@/constants";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS as DIMS, FONTS } from "@/constants/theme";

export const AdherenceAnalyticsScreen: React.FC = () => {
  const { medications, getAdherenceRate, getAdherenceStats, getAIInsights } =
    useMedicationContext();
  const { insights: patterns, analyzePatterns } = useBehaviorAnalysis();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<7 | 30 | 90>(30);
  const [aiInsights, setAIInsights] = useState<{
    insights: string[];
    suggestions: string[];
    encouragement: string;
  } | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeframe]);

  const loadAnalytics = async () => {
    await analyzePatterns(selectedTimeframe);
    const ai = await getAIInsights();
    setAIInsights(ai);
  };

  console.log({ patterns, aiInsights });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
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

  const overallStats = getAdherenceStats();
  const overallRate = getAdherenceRate();
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
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          {([7, 30, 90] as const).map((days) => (
            <TouchableOpacity
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall Adherence Card */}
        <View style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <Text style={styles.overallTitle}>Overall Adherence</Text>
            <View style={[styles.adherenceLabel, { backgroundColor: adherenceColor + "20" }]}>
              <Text style={[styles.adherenceLabelText, { color: adherenceColor }]}>
                {adherenceLabel}
              </Text>
            </View>
          </View>

          <View style={styles.circularProgress}>
            <Text style={[styles.percentageText, { color: adherenceColor }]}>{overallRate}%</Text>
            <Text style={styles.percentageLabel}>Adherence Rate</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.statValue}>{overallStats.taken}</Text>
              <Text style={styles.statLabel}>Taken</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
              <Text style={styles.statValue}>{overallStats.missed}</Text>
              <Text style={styles.statLabel}>Missed</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="remove-circle" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>{overallStats.skipped}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
          </View>

          {overallStats.streak > 0 && (
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={20} color={COLORS.warning} />
              <Text style={styles.streakText}>{overallStats.streak} day streak!</Text>
            </View>
          )}
        </View>

        {/* AI Insights */}
        {aiInsights && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>AI Insights</Text>
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.insightsSubtitle}>Key Observations</Text>
              {aiInsights?.insights?.map((insight, index) => (
                <View key={index} style={styles.insightRow}>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>

            <View style={styles.insightsCard}>
              <Text style={styles.insightsSubtitle}>Personalized Suggestions</Text>
              {aiInsights?.suggestions?.map((suggestion, index) => (
                <View key={index} style={styles.suggestionRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>

            {aiInsights?.encouragement && (
              <View style={styles.encouragementCard}>
                <Ionicons name="heart" size={20} color={COLORS.error} />
                <Text style={styles.encouragementText}>{aiInsights.encouragement}</Text>
              </View>
            )}
          </>
        )}

        {/* Pattern Analysis */}
        {patterns && (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Patterns</Text>
            </View>

            <View style={styles.patternCard}>
              <View style={styles.patternRow}>
                <View style={styles.patternItem}>
                  <Ionicons name="sunny" size={24} color={COLORS.warning} />
                  <Text style={styles.patternLabel}>Best Time</Text>
                  <Text style={styles.patternValue}>
                    {patterns.bestTimeOfDay.charAt(0).toUpperCase() +
                      patterns.bestTimeOfDay.slice(1)}
                  </Text>
                </View>

                <View style={styles.patternDivider} />

                <View style={styles.patternItem}>
                  <Ionicons name="moon" size={24} color={COLORS.info} />
                  <Text style={styles.patternLabel}>Challenging Time</Text>
                  <Text style={styles.patternValue}>
                    {patterns.worstTimeOfDay.charAt(0).toUpperCase() +
                      patterns.worstTimeOfDay.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.patternDividerHorizontal} />

              <View style={styles.patternRow}>
                <View style={styles.patternItem}>
                  <Ionicons name="calendar" size={24} color={COLORS.primary} />
                  <Text style={styles.patternLabel}>Best Day</Text>
                  <Text style={styles.patternValue}>{patterns.bestDayOfWeek}</Text>
                </View>

                <View style={styles.patternDivider} />

                <View style={styles.patternItem}>
                  <Ionicons
                    name={
                      patterns.adherenceTrend === "improving"
                        ? "trending-up"
                        : patterns.adherenceTrend === "declining"
                        ? "trending-down"
                        : "remove"
                    }
                    size={24}
                    color={
                      patterns.adherenceTrend === "improving"
                        ? COLORS.success
                        : patterns.adherenceTrend === "declining"
                        ? COLORS.error
                        : COLORS.gray.medium
                    }
                  />
                  <Text style={styles.patternLabel}>Trend</Text>
                  <Text style={styles.patternValue}>
                    {patterns.adherenceTrend.charAt(0).toUpperCase() +
                      patterns.adherenceTrend.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* By Medication */}
        <View style={styles.sectionHeader}>
          <Ionicons name="medical" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>By Medication</Text>
        </View>

        {medications.map((medication) => {
          const medStats = getAdherenceStats(medication.id);
          const medRate = getAdherenceRate(medication.id);
          const medColor = getAdherenceColor(medRate);

          return (
            <View key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medication.name}</Text>
                  <Text style={styles.medicationDosage}>
                    {medication.dosage}
                    {medication.unit}
                  </Text>
                </View>
                <View style={[styles.medicationRate, { backgroundColor: medColor + "20" }]}>
                  <Text style={[styles.medicationRateText, { color: medColor }]}>{medRate}%</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${medRate}%`, backgroundColor: medColor }]}
                />
              </View>

              <View style={styles.medicationStats}>
                {[
                  { stat: medStats.taken, label: "Taken" },
                  { stat: medStats.missed, label: "Missed" },
                  { stat: medStats.skipped, label: "Skipped" },
                ].map((item) => (
                  <View style={styles.medicationStat} key={item.label}>
                    <Text style={styles.medicationStatValue}>{item.stat}</Text>
                    <Text style={styles.medicationStatLabel}>{item.label}</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: DIMS.PADDING, paddingVertical: 20 },
  title: { fontSize: FONTS.size.huge, fontWeight: "bold", color: COLORS.black },
  timeframeContainer: {
    flexDirection: "row",
    paddingHorizontal: DIMS.PADDING,
    marginBottom: 20,
    gap: 12,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  timeframeButtonActive: { backgroundColor: COLORS.primary },
  timeframeText: { fontSize: FONTS.size.medium, color: COLORS.gray.dark, fontWeight: "500" },
  timeframeTextActive: { color: COLORS.white, fontWeight: "600" },
  overallCard: {
    marginHorizontal: DIMS.PADDING,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  overallTitle: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.black },
  adherenceLabel: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  adherenceLabelText: { fontSize: FONTS.size.small, fontWeight: "600" },
  circularProgress: { alignItems: "center", marginVertical: 20 },
  percentageText: { fontSize: 48, fontWeight: "bold" },
  percentageLabel: { fontSize: FONTS.size.medium, color: COLORS.gray.medium, marginTop: 8 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 20 },
  statItem: { alignItems: "center", gap: 8 },
  statValue: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.black },
  statLabel: { fontSize: FONTS.size.small, color: COLORS.gray.medium },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.warning + "10",
    borderRadius: 12,
    gap: 8,
  },
  streakText: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.warning },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DIMS.PADDING,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.black },
  insightsCard: {
    marginHorizontal: DIMS.PADDING,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  insightsSubtitle: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 12,
  },
  insightRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 8 },
  insightText: { flex: 1, fontSize: FONTS.size.small, color: COLORS.gray.dark, lineHeight: 20 },
  suggestionRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 8 },
  suggestionText: { flex: 1, fontSize: FONTS.size.small, color: COLORS.gray.dark, lineHeight: 20 },
  encouragementCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: DIMS.PADDING,
    marginBottom: 20,
    backgroundColor: COLORS.success + "10",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  encouragementText: {
    flex: 1,
    fontSize: FONTS.size.medium,
    color: COLORS.gray.dark,
    lineHeight: 22,
  },
  patternCard: {
    marginHorizontal: DIMS.PADDING,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  patternRow: { flexDirection: "row" },
  patternItem: { flex: 1, alignItems: "center", gap: 8 },
  patternLabel: { fontSize: FONTS.size.small, color: COLORS.gray.medium },
  patternValue: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.black },
  patternDivider: { width: 1, backgroundColor: COLORS.gray.light, marginHorizontal: 16 },
  patternDividerHorizontal: { height: 1, backgroundColor: COLORS.gray.light, marginVertical: 20 },
  medicationCard: {
    marginHorizontal: DIMS.PADDING,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  medicationInfo: { flex: 1 },
  medicationName: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.black },
  medicationDosage: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 2 },
  medicationRate: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  medicationRateText: { fontSize: FONTS.size.medium, fontWeight: "600" },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray.lightest,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: { height: "100%", borderRadius: 4 },
  medicationStats: { flexDirection: "row", justifyContent: "space-around" },
  medicationStat: { alignItems: "center" },
  medicationStatValue: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.black },
  medicationStatLabel: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium, marginTop: 4 },
});
