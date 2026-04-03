import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { COLORS } from "@/constants/colors";
import { Medication, MedicationSchedule } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "@/constants/theme";
import { format } from "date-fns";

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  onDelete: () => void;
  onMarkTaken: (medicationId: string, scheduleId: string, name: string) => void;
  onMarkSkipped: (medicationId: string, scheduleId: string, name: string) => Promise<void>;
  adherence: number;
}

export const MedicationCard = React.memo<MedicationCardProps>((props) => {
  const { medication, onEdit, onDelete, onMarkTaken, onMarkSkipped, adherence } = props;
  const [expanded, setExpanded] = useState(false);

  const getScheduleStatus = (schedule: MedicationSchedule) => {
    if (schedule.taken) return "taken";
    if (schedule.skipped) return "skipped";
    return "pending";
  };

  return (
    <Pressable
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.medName}>{medication.name}</Text>
          <Text style={styles.medDosage}>
            {medication.dosage}{medication.unit} • {medication.purpose}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.adherenceBadge}>
            <Text style={styles.adherenceText}>{adherence}%</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.gray.light}
          />
        </View>
      </View>

      {/* Schedule chips */}
      <View style={styles.chipRow}>
        {medication.schedule.map((schedule) => {
          const status = getScheduleStatus(schedule);
          return (
            <View
              key={schedule.id}
              style={[
                styles.chip,
                status === "taken" && styles.chipTaken,
                status === "skipped" && styles.chipSkipped,
              ]}
            >
              {status === "taken" && (
                <Ionicons name="checkmark" size={12} color={COLORS.success} />
              )}
              {status === "skipped" && (
                <Ionicons name="close" size={12} color={COLORS.error} />
              )}
              <Text
                style={[
                  styles.chipText,
                  status === "taken" && styles.chipTextTaken,
                  status === "skipped" && styles.chipTextSkipped,
                ]}
              >
                {schedule.time}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Expanded section */}
      {expanded && (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedTitle}>Today's Schedule</Text>

          {medication.schedule.map((schedule) => {
            const status = getScheduleStatus(schedule);
            return (
              <View key={schedule.id} style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>{schedule.time}</Text>

                {status === "taken" ? (
                  <View style={styles.statusRow}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.statusText}>Taken</Text>
                  </View>
                ) : status === "skipped" ? (
                  <View style={styles.statusRow}>
                    <Ionicons name="close-circle" size={16} color={COLORS.error} />
                    <Text style={styles.statusText}>Skipped</Text>
                  </View>
                ) : (
                  <View style={styles.scheduleActions}>
                    <Pressable
                      style={styles.takeBtn}
                      onPress={() => onMarkTaken(medication.id, schedule.id, medication.name)}
                    >
                      <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    </Pressable>
                    <Pressable
                      style={styles.skipBtn}
                      onPress={() => onMarkSkipped(medication.id, schedule.id, medication.name)}
                    >
                      <Ionicons name="close" size={14} color={COLORS.gray.medium} />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.divider} />

          {medication.instructions && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color={COLORS.gray.medium} />
              <Text style={styles.detailText}>{medication.instructions}</Text>
            </View>
          )}

          {medication.refillDate && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.gray.medium} />
              <Text style={styles.detailText}>
                Refill by: {format(new Date(medication.refillDate), "MMM dd, yyyy")}
              </Text>
            </View>
          )}

          <View style={styles.cardButtons}>
            <Pressable style={styles.editBtn} onPress={onEdit}>
              <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfo: { flex: 1 },
  medName: {
    fontSize: FONTS.size.large,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  medDosage: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adherenceBadge: {
    backgroundColor: COLORS.tint.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  adherenceText: {
    fontSize: FONTS.size.small,
    fontWeight: "600",
    color: COLORS.success,
  },

  // Chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.gray.lightest,
  },
  chipTaken: { backgroundColor: COLORS.tint.green },
  chipSkipped: { backgroundColor: COLORS.error + "12" },
  chipText: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
  },
  chipTextTaken: { color: COLORS.success, fontWeight: "500" },
  chipTextSkipped: { color: COLORS.error, fontWeight: "500" },

  // Expanded
  expandedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.lighter,
  },
  expandedTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  scheduleTime: {
    fontSize: FONTS.size.medium,
    fontWeight: "500",
    color: COLORS.primaryDark,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusText: { fontSize: FONTS.size.small, color: COLORS.gray.medium },
  scheduleActions: { flexDirection: "row", gap: 8 },
  takeBtn: {
    backgroundColor: COLORS.success,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  skipBtn: {
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray.lighter,
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  detailText: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    flex: 1,
  },
  cardButtons: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.tint.pink,
    gap: 6,
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: FONTS.size.small,
    fontWeight: "600",
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    gap: 6,
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: FONTS.size.small,
    fontWeight: "600",
  },
});
