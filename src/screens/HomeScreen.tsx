import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import useBehaviorAnalysis from "@/hooks/useBehaviorAnalysis";
import { useHomeScreen } from "@/services/useHomeScreen";
import { HomeHeader } from "@/components/HomeHeader";

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
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

  const handleAIAssistant = () => {
    navigation.navigate("AIAssistant" as never);
  };

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
        <HomeHeader name={userName} />

        {/* Pending Doses Alert */}
        {pendingDoses.length > 0 && (
          <View style={styles.pendingSection}>
            <View style={styles.pendingSectionHeader}>
              <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
              <Text style={styles.pendingSectionTitle}>Pending Doses</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingDoses.length}</Text>
              </View>
            </View>

            {pendingDoses.map(({ medication, schedule }) => (
              <View key={`${medication.id}-${schedule.id}`} style={styles.pendingCard}>
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingMedName}>{medication.name}</Text>
                  <Text style={styles.pendingDosage}>
                    {medication.dosage}
                    {medication.unit} • {schedule.time}
                  </Text>
                  {medication.instructions && (
                    <Text style={styles.pendingInstructions}>{medication.instructions}</Text>
                  )}
                </View>

                <View style={styles.pendingActions}>
                  <TouchableOpacity
                    style={styles.takenButton}
                    onPress={() => handleMarkTaken(medication.id, schedule.id, medication.name)}
                    accessibilityLabel={`Mark ${medication.name} as taken`}
                  >
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => handleMarkSkipped(medication.id, schedule.id)}
                    accessibilityLabel={`Skip ${medication.name}`}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {quickStats.map((item) => (
            <View style={styles.statCard} key={item.subTitle}>
              <Ionicons name={item.icon} size={24} color={item.color} />
              <Text style={styles.statValue}>{item.title}</Text>
              <Text style={styles.statLabel}>{item.subTitle}</Text>
            </View>
          ))}
        </View>

        {/* AI Assistant Quick Access */}
        <TouchableOpacity style={styles.aiCard} onPress={handleAIAssistant}>
          <View style={styles.aiCardContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="mic" size={32} color={COLORS.white} />
            </View>
            <View style={styles.aiCardText}>
              <Text style={styles.aiCardTitle}>Talk to AI Assistant</Text>
              <Text style={styles.aiCardSubtitle}>Ask questions or add medications by voice</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* AI Insights */}
        {insights && insights.suggestions.length > 0 && (
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Ionicons name="bulb" size={20} color={COLORS.primary} />
              <Text style={styles.insightsTitle}>AI Insights</Text>
            </View>
            {insights.suggestions.slice(0, 2).map((suggestion, index) => (
              <View key={index} style={styles.insightRow}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                <Text style={styles.insightText}>{suggestion}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.viewMoreButton} onPress={handleViewAnalytics}>
              <Text style={styles.viewMoreText}>View Full Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Doses */}
        {upcomingDoses.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Doses</Text>
              <TouchableOpacity onPress={handleViewAllMedications}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {upcomingDoses.map(({ medication, schedule }) => (
              <View key={`${medication.id}-${schedule.id}`} style={styles.upcomingCard}>
                <View style={styles.upcomingTime}>
                  <Text style={styles.upcomingTimeText}>{schedule.time}</Text>
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingMedName}>{medication.name}</Text>
                  <Text style={styles.upcomingDosage}>
                    {medication.dosage}
                    {medication.unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((item) => (
              <TouchableOpacity style={styles.actionButton} onPress={item.onPress} key={item.id}>
                <Ionicons name={item.icon} size={32} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddMedication")}
        accessibilityLabel="Add medication"
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 80, // Above tab bar
    right: DIMENSIONS.SPACING.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  pendingSection: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 20,
    backgroundColor: COLORS.warning + "10",
    borderRadius: 16,
    padding: 16,
  },
  pendingSectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  pendingSectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: "600",
    color: COLORS.warning,
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: { color: COLORS.white, fontSize: FONTS.size.small, fontWeight: "600" },
  pendingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  pendingInfo: { flex: 1 },
  pendingMedName: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.black },
  pendingDosage: { fontSize: FONTS.size.small, color: COLORS.gray.dark, marginTop: 4 },
  pendingInstructions: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 4,
    fontStyle: "italic",
  },
  pendingActions: { flexDirection: "row", gap: 8 },
  takenButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  takenButtonText: { color: COLORS.white, fontSize: FONTS.size.small, fontWeight: "600" },
  skipButton: { padding: 10, justifyContent: "center", alignItems: "center" },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: DIMENSIONS.PADDING,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: FONTS.size.extraLarge,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: { fontSize: FONTS.size.small, color: COLORS.gray.dark, marginTop: 4 },
  aiCard: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 20,
    backgroundColor: COLORS.primary + "15",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.primary + "30",
  },
  aiCardContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  aiIconContainer: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  aiCardText: { flex: 1 },
  aiCardTitle: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.black },
  aiCardSubtitle: { fontSize: FONTS.size.small, color: COLORS.gray.dark, marginTop: 4 },
  insightsCard: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  insightsTitle: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.black },
  insightRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 8 },
  insightText: { flex: 1, fontSize: FONTS.size.small, color: COLORS.gray.dark, lineHeight: 20 },
  viewMoreButton: { marginTop: 8, paddingVertical: 8 },
  viewMoreText: { color: COLORS.primary, fontSize: FONTS.size.small, fontWeight: "600" },
  upcomingSection: { marginHorizontal: DIMENSIONS.PADDING, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.black },
  viewAllText: { color: COLORS.primary, fontSize: FONTS.size.small, fontWeight: "600" },
  upcomingCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: "center",
    gap: 16,
  },
  upcomingTime: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upcomingTimeText: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primary },
  upcomingInfo: { flex: 1 },
  upcomingMedName: { fontSize: FONTS.size.medium, fontWeight: "500", color: COLORS.black },
  upcomingDosage: { fontSize: FONTS.size.small, color: COLORS.gray.dark, marginTop: 2 },
  quickActions: { marginHorizontal: DIMENSIONS.PADDING, marginBottom: 20 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.dark,
    marginTop: 8,
    textAlign: "center",
  },
});
