import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/theme";
import { StatItem } from "./StatItem";

interface AdherenceStats {
  taken: number;
  missed: number;
  skipped: number;
  rate: number;
  streak: number;
}

interface AdherenceOverviewCardProps {
  stats: AdherenceStats;
  adherenceColor: string;
  adherenceLabel: string;
}

export const AdherenceOverviewCard: React.FC<AdherenceOverviewCardProps> = ({
  stats,
  adherenceColor,
  adherenceLabel,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Overall Adherence</Text>
        <View style={[styles.badge, { backgroundColor: adherenceColor + "15" }]}>
          <Text style={[styles.badgeText, { color: adherenceColor }]}>{adherenceLabel}</Text>
        </View>
      </View>

      <View style={styles.rateSection}>
        <Text style={[styles.rateText, { color: adherenceColor }]}>{stats.rate}%</Text>
        <Text style={styles.rateLabel}>Adherence Rate</Text>
      </View>

      <View style={styles.statsRow}>
        <StatItem icon="checkmark-circle" iconColor={COLORS.success} iconBg={COLORS.tint.green} value={stats.taken} label="Taken" />
        <StatItem icon="close-circle" iconColor={COLORS.error} iconBg={COLORS.error + "12"} value={stats.missed} label="Missed" />
        <StatItem icon="remove-circle" iconColor={COLORS.warning} iconBg={COLORS.tint.peach} value={stats.skipped} label="Skipped" />
      </View>

      {stats.streak > 0 && (
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={18} color={COLORS.warning} />
          <Text style={styles.streakText}>{stats.streak} day streak!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: FONTS.size.small, fontWeight: "600" },
  rateSection: { alignItems: "center", marginBottom: 20 },
  rateText: { fontSize: 44, fontWeight: "700" },
  rateLabel: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 4 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
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
});
