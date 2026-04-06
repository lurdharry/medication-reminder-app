import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/theme";

interface PatternItem {
  label: string;
  value: string;
  color?: string;
}

interface PatternsCardProps {
  items: PatternItem[];
}

export const PatternsCard: React.FC<PatternsCardProps> = ({ items }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Ionicons name="analytics" size={16} color={COLORS.primaryDark} />
        </View>
        <Text style={styles.title}>Patterns</Text>
      </View>

      <View style={styles.grid}>
        {items.map((item) => (
          <View style={styles.item} key={item.label}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <Text style={[styles.itemValue, item.color ? { color: item.color } : undefined]}>
              {item.value}
            </Text>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  iconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.tint.purple,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  item: { width: "50%", paddingVertical: 10, alignItems: "center" },
  itemLabel: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium, marginBottom: 4 },
  itemValue: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark },
});
