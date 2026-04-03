import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
        <View style={styles.statsCard}>
          {quickStats.map((item, index) => (
            <React.Fragment key={item.subTitle}>
              {index > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.title}</Text>
                <Text style={styles.statLabel}>{item.subTitle}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Pending Doses */}
        {pendingDoses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Doses</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingDoses.length}</Text>
              </View>
            </View>

            {pendingDoses.map(({ medication, schedule }) => (
              <View key={`${medication.id}-${schedule.id}`} style={styles.medCard}>
                <View style={styles.medCardLeft}>
                  <View style={styles.timeChip}>
                    <Text style={styles.timeChipText}>{schedule.time}</Text>
                  </View>
                  <View>
                    <Text style={styles.medName}>{medication.name}</Text>
                    <Text style={styles.medDosage}>
                      {medication.dosage}{medication.unit}
                    </Text>
                  </View>
                </View>
                <View style={styles.medActions}>
                  <Pressable
                    style={styles.actionCircle}
                    onPress={() => handleMarkTaken(medication.id, schedule.id, medication.name)}
                  >
                    <Ionicons name="checkmark" size={18} color={COLORS.white} />
                  </Pressable>
                  <Pressable
                    style={styles.actionCircleOutline}
                    onPress={() => handleMarkSkipped(medication.id, schedule.id)}
                  >
                    <Ionicons name="close" size={18} color={COLORS.gray.medium} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* AI Assistant */}
        <Pressable
          style={styles.aiCard}
          onPress={() => navigation.navigate("Assistant")}
        >
          <View style={styles.aiIconBg}>
            <Ionicons name="mic" size={22} color={COLORS.primaryDark} />
          </View>
          <View style={styles.aiCardText}>
            <Text style={styles.aiCardTitle}>AI Assistant</Text>
            <Text style={styles.aiCardSubtitle}>Ask questions or manage meds</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray.light} />
        </Pressable>

        {/* AI Insights */}
        {insights && insights.suggestions.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.statIconBg, { backgroundColor: COLORS.tint.peach }]}>
                <Ionicons name="bulb" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.cardTitle}>Insights</Text>
            </View>
            {insights.suggestions.slice(0, 2).map((suggestion, index) => (
              <View key={index} style={styles.insightRow}>
                <View style={styles.dot} />
                <Text style={styles.insightText}>{suggestion}</Text>
              </View>
            ))}
            <Pressable style={styles.linkButton} onPress={handleViewAnalytics}>
              <Text style={styles.linkText}>View Full Report</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primaryDark} />
            </Pressable>
          </View>
        )}

        {/* Upcoming Doses */}
        {upcomingDoses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              <Pressable onPress={handleViewAllMedications}>
                <Text style={styles.linkText}>View All</Text>
              </Pressable>
            </View>

            {upcomingDoses.map(({ medication, schedule }) => (
              <View key={`${medication.id}-${schedule.id}`} style={styles.medCard}>
                <View style={styles.medCardLeft}>
                  <View style={[styles.timeChip, styles.timeChipMuted]}>
                    <Text style={[styles.timeChipText, styles.timeChipTextMuted]}>{schedule.time}</Text>
                  </View>
                  <View>
                    <Text style={styles.medName}>{medication.name}</Text>
                    <Text style={styles.medDosage}>{medication.dosage}{medication.unit}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray.light} />
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((item, index) => {
              const tints = [COLORS.tint.pink, COLORS.tint.blue, COLORS.tint.peach, COLORS.tint.purple];
              const tint = tints[index % tints.length];
              return (
                <Pressable style={styles.actionButton} onPress={item.onPress} key={item.id}>
                  <View style={[styles.actionIconBg, { backgroundColor: tint }]}>
                    <Ionicons name={item.icon} size={22} color={COLORS.primaryDark} />
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("AddMedication")}
      >
        <Ionicons name="add" size={26} color={COLORS.white} />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // Stats
  statsCard: {
    flexDirection: "row",
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.gray.lighter,
  },
  statIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: FONTS.size.huge,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  statLabel: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.dark,
    marginTop: 6,
    fontWeight: "500",
  },

  // Sections
  section: {
    paddingHorizontal: DIMENSIONS.PADDING,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  badge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONTS.size.tiny,
    fontWeight: "700",
  },

  // Med Cards
  medCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  medCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeChip: {
    backgroundColor: COLORS.tint.blue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeChipText: {
    fontSize: FONTS.size.small,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  timeChipMuted: {
    backgroundColor: COLORS.gray.lightest,
  },
  timeChipTextMuted: {
    color: COLORS.gray.medium,
  },
  medName: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  medDosage: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 1,
  },
  medActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  actionCircleOutline: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: COLORS.gray.lighter,
    justifyContent: "center",
    alignItems: "center",
  },

  // AI Card
  aiCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 24,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    gap: 14,
  },
  aiIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.tint.purple,
    justifyContent: "center",
    alignItems: "center",
  },
  aiCardText: { flex: 1 },
  aiCardTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  aiCardSubtitle: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 2,
  },

  // Card
  card: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primaryDark,
    marginTop: 7,
  },
  insightText: {
    flex: 1,
    fontSize: FONTS.size.small,
    color: COLORS.gray.dark,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  linkText: {
    color: COLORS.primaryDark,
    fontSize: FONTS.size.small,
    fontWeight: "600",
  },

  // Quick Actions
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  actionIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.dark,
    marginTop: 10,
    fontWeight: "500",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 80,
    right: DIMENSIONS.SPACING.lg,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
