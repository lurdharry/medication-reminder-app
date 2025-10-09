import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { COLORS } from "@/constants/colors";
import { Medication, MedicationSchedule } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "@/constants/theme";
import { StyleSheet } from "react-native";

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
    <TouchableOpacity
      style={styles.medicationCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.medicationDosage}>
            {medication.dosage}
            {medication.unit}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <View style={styles.adherenceBadge}>
            <Text style={styles.adherenceText}>{adherence}%</Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={COLORS.gray.medium}
          />
        </View>
      </View>

      <View style={styles.scheduleSummary}>
        {medication.schedule.map((schedule) => {
          const status = getScheduleStatus(schedule);
          return (
            <View
              key={schedule.id}
              style={[
                styles.scheduleChip,
                status === "taken" && styles.scheduleChipTaken,
                status === "skipped" && styles.scheduleChipSkipped,
              ]}
            >
              <Text
                style={[
                  styles.scheduleChipText,
                  status === "taken" && styles.scheduleChipTextTaken,
                  status === "skipped" && styles.scheduleChipTextSkipped,
                ]}
              >
                {schedule.time}
                {status === "taken" && " ✓"}
                {status === "skipped" && " ⏭"}
              </Text>
            </View>
          );
        })}
      </View>

      {expanded && (
        <View style={styles.cardExpanded}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          {medication.schedule.map((schedule) => {
            const status = getScheduleStatus(schedule);
            return (
              <View key={schedule.id} style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>{schedule.time}</Text>

                {status === "taken" ? (
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.statusText}>Taken</Text>
                  </View>
                ) : status === "skipped" ? (
                  <View style={styles.statusBadge}>
                    <Ionicons name="close-circle" size={16} color={COLORS.error} />
                    <Text style={styles.statusText}>Skipped</Text>
                  </View>
                ) : (
                  <View style={styles.scheduleActions}>
                    <TouchableOpacity
                      style={styles.miniTakenButton}
                      onPress={() => onMarkTaken(medication.id, schedule.id, medication.name)}
                    >
                      <Ionicons name="checkmark" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.miniSkipButton}
                      onPress={() => onMarkSkipped(medication.id, schedule.id, medication.name)}
                    >
                      <Ionicons name="close" size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.gray.dark} />
            <Text style={styles.detailText}>{medication.purpose}</Text>
          </View>

          {medication.instructions && (
            <View style={styles.detailRow}>
              <Ionicons name="list-outline" size={20} color={COLORS.gray.dark} />
              <Text style={styles.detailText}>{medication.instructions}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.gray.dark} />
            <Text style={styles.detailText}>
              Refill by: {new Date(medication.refillDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
              <Ionicons name="pencil" size={20} color={COLORS.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  medicationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardInfo: { flex: 1 },
  medicationName: {
    fontSize: FONTS.size.large,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  medicationDosage: { fontSize: FONTS.size.medium, color: COLORS.gray.dark },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  adherenceBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adherenceText: { fontSize: FONTS.size.small, fontWeight: "600", color: COLORS.success },
  scheduleSummary: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 },
  scheduleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.gray.light,
  },
  scheduleChipTaken: { backgroundColor: COLORS.success + "20" },
  scheduleChipSkipped: { backgroundColor: COLORS.error + "20" },
  scheduleChipText: { fontSize: FONTS.size.small, color: COLORS.gray.dark },
  scheduleChipTextTaken: { color: COLORS.success, fontWeight: "600" },
  scheduleChipTextSkipped: { color: COLORS.error, fontWeight: "600" },
  cardExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.light,
  },
  sectionTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  scheduleTime: { fontSize: FONTS.size.medium, fontWeight: "500", color: COLORS.black },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusText: { fontSize: FONTS.size.small, color: COLORS.gray.dark },
  scheduleActions: { flexDirection: "row", gap: 8 },
  miniTakenButton: { backgroundColor: COLORS.success, padding: 8, borderRadius: 6 },
  miniSkipButton: { backgroundColor: COLORS.error + "20", padding: 8, borderRadius: 6 },
  divider: { height: 1, backgroundColor: COLORS.gray.light, marginVertical: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  detailText: { fontSize: FONTS.size.medium, color: COLORS.gray.dark, flex: 1 },
  actionButtons: { flexDirection: "row", marginTop: 16, gap: 12 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: { backgroundColor: COLORS.primary + "15" },
  editButtonText: { color: COLORS.primary, fontSize: FONTS.size.medium, fontWeight: "600" },
  deleteButton: { backgroundColor: COLORS.error + "15" },
  deleteButtonText: { color: COLORS.error, fontSize: FONTS.size.medium, fontWeight: "600" },
});
