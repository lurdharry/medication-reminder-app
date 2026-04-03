import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import useBehaviorAnalysis from "@/hooks/useBehaviorAnalysis";
import { useHomeScreen } from "@/services/useHomeScreen";
import { HomeHeader } from "@/components/HomeHeader";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export const HomeScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const { insights } = useBehaviorAnalysis();

  const {
    quickActions,
    handleViewAllMedications,
    handleViewAnalytics,
    quickStats,
    handleRefresh,
    refreshing,
    pendingDoses,
    userName,
    handleMarkSkipped,
    handleMarkTaken,
    upcomingDoses,
  } = useHomeScreen();

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
        <HomeHeader name={userName} />

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {quickStats.map((item) => (
            <View style={styles.statCard} key={item.subTitle}>
              <View style={[styles.statIconBg, { backgroundColor: item.color + "20" }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.statValue}>{item.title}</Text>
              <Text style={styles.statLabel}>{item.subTitle}</Text>
            </View>
          ))}
        </View>

        {/* Pending Doses */}
        {pendingDoses.length > 0 && (
          <View style={styles.pendingSection}>
            <View style={styles.pendingSectionHeader}>
              <View style={styles.pendingIconBg}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              </View>
              <Text style={styles.pendingSectionTitle}>Pending Doses</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingDoses.length}</Text>
              </View>
            </View>

            {pendingDoses.map(({ medication, schedule }) => (
              <View key={`${medication.id}-${schedule.id}`} style={styles.pendingCard}>
                <View style={styles.pendingTimeTag}>
                  <Text style={styles.pendingTimeText}>{schedule.time}</Text>
                </View>
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingMedName}>{medication.name}</Text>
                  <Text style={styles.pendingDosage}>
                    {medication.dosage}{medication.unit}
                    {medication.instructions ? ` • ${medication.instructions}` : ""}
                  </Text>
                </View>
                <View style={styles.pendingActions}>
                  <Pressable
                    style={styles.takenButton}
                    onPress={() => handleMarkTaken(medication.id, schedule.id, medication.name)}
                  >
                    <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
                  </Pressable>
                  <Pressable
                    style={styles.skipButton}
                    onPress={() => handleMarkSkipped(medication.id, schedule.id)}
                  >
                    <Ionicons name="close-circle" size={32} color={COLORS.gray.light} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* AI Assistant Card */}
        <Pressable
          style={styles.aiCard}
          onPress={() => navigation.navigate("Assistant")}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCardGradient}
          >
            <View style={styles.aiIconContainer}>
              <Ionicons name="mic" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.aiCardText}>
              <Text style={styles.aiCardTitle}>Talk to AI Assistant</Text>
              <Text style={styles.aiCardSubtitle}>Ask questions or manage meds by voice</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white + "CC"} />
          </LinearGradient>
        </Pressable>

        {/* AI Insights */}
        {insights && insights.suggestions.length > 0 && (
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.accent + "30" }]}>
                <Ionicons name="bulb" size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.insightsTitle}>AI Insights</Text>
            </View>
            {insights.suggestions.slice(0, 2).map((suggestion, index) => (
              <View key={index} style={styles.insightRow}>
                <View style={styles.insightDot} />
                <Text style={styles.insightText}>{suggestion}</Text>
              </View>
            ))}
            <Pressable style={styles.viewMoreButton} onPress={handleViewAnalytics}>
              <Text style={styles.viewMoreText}>View Full Report</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </Pressable>
          </View>
        )}

        {/* Upcoming Doses */}
        {upcomingDoses.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              <Pressable onPress={handleViewAllMedications}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            </View>

            {upcomingDoses.map(({ medication, schedule }) => (
              <View key={`${medication.id}-${schedule.id}`} style={styles.upcomingCard}>
                <View style={styles.upcomingTime}>
                  <Text style={styles.upcomingTimeText}>{schedule.time}</Text>
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingMedName}>{medication.name}</Text>
                  <Text style={styles.upcomingDosage}>
                    {medication.dosage}{medication.unit}
                  </Text>
                </View>
                <Ionicons name="time-outline" size={20} color={COLORS.gray.light} />
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((item) => (
              <Pressable style={styles.actionButton} onPress={item.onPress} key={item.id}>
                <View style={[styles.actionIconBg, { backgroundColor: COLORS.primary + "15" }]}>
                  <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.actionButtonText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("AddMedication")}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Stats
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: DIMENSIONS.PADDING,
    marginBottom: 20,
    gap: 10,
    marginTop: -14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: FONTS.size.extraLarge,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginTop: 6,
  },
  statLabel: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium, marginTop: 2 },

  // Pending
  pendingSection: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 20,
  },
  pendingSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  pendingIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.error + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingSectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: "600",
    color: COLORS.primaryDark,
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pendingBadgeText: { color: COLORS.white, fontSize: FONTS.size.tiny, fontWeight: "700" },
  pendingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    gap: 12,
  },
  pendingTimeTag: {
    backgroundColor: COLORS.error + "12",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingTimeText: { fontSize: FONTS.size.small, fontWeight: "700", color: COLORS.error },
  pendingInfo: { flex: 1 },
  pendingMedName: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
  pendingDosage: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 2 },
  pendingActions: { flexDirection: "row", gap: 4 },
  takenButton: { padding: 2 },
  skipButton: { padding: 2 },

  // AI Card
  aiCard: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 20,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  aiCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 14,
  },
  aiIconContainer: {
    backgroundColor: COLORS.white,
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  aiCardText: { flex: 1 },
  aiCardTitle: { fontSize: FONTS.size.large, fontWeight: "700", color: COLORS.white },
  aiCardSubtitle: { fontSize: FONTS.size.small, color: COLORS.white + "CC", marginTop: 3 },

  // Insights
  insightsCard: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  insightsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 10 },
  insightsTitle: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
  insightRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
  },
  insightText: { flex: 1, fontSize: FONTS.size.small, color: COLORS.gray.dark, lineHeight: 20 },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingVertical: 6,
  },
  viewMoreText: { color: COLORS.primary, fontSize: FONTS.size.small, fontWeight: "600" },

  // Upcoming
  upcomingSection: { marginHorizontal: DIMENSIONS.PADDING, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: FONTS.size.large, fontWeight: "700", color: COLORS.primaryDark },
  viewAllText: { color: COLORS.primary, fontSize: FONTS.size.small, fontWeight: "600" },
  upcomingCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    alignItems: "center",
    gap: 14,
    elevation: 1,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  upcomingTime: {
    backgroundColor: COLORS.primary + "12",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upcomingTimeText: { fontSize: FONTS.size.small, fontWeight: "700", color: COLORS.primary },
  upcomingInfo: { flex: 1 },
  upcomingMedName: { fontSize: FONTS.size.medium, fontWeight: "500", color: COLORS.primaryDark },
  upcomingDosage: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 2 },

  // Quick Actions
  quickActions: { marginHorizontal: DIMENSIONS.PADDING, marginBottom: 20 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.dark,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "500",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 80,
    right: DIMENSIONS.SPACING.lg,
    borderRadius: 18,
    elevation: 8,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
