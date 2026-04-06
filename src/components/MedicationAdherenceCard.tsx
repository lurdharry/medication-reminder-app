import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/theme";

interface MedicationAdherenceCardProps {
  name: string;
  dosage: string;
  unit: string;
  rate: number;
  taken: number;
  missed: number;
  skipped: number;
  color: string;
}

export const MedicationAdherenceCard: React.FC<MedicationAdherenceCardProps> = ({
  name,
  dosage,
  unit,
  rate,
  taken,
  missed,
  skipped,
  color,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.dosage}>{dosage}{unit}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + "15" }]}>
          <Text style={[styles.badgeText, { color }]}>{rate}%</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${rate}%`, backgroundColor: color }]} />
      </View>

      <View style={styles.statsRow}>
        {[
          { stat: taken, label: "Taken" },
          { stat: missed, label: "Missed" },
          { stat: skipped, label: "Skipped" },
        ].map((item) => (
          <View style={styles.statItem} key={item.label}>
            <Text style={styles.statValue}>{item.stat}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
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
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  info: { flex: 1 },
  name: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
  dosage: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: FONTS.size.small, fontWeight: "600" },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.gray.lightest,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
  statLabel: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium, marginTop: 2 },
});
