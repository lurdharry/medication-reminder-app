import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface StatItemProps {
  icon: IoniconsName;
  iconColor: string;
  iconBg: string;
  value: number;
  label: string;
}

export const StatItem: React.FC<StatItemProps> = ({
  icon,
  iconColor,
  iconBg,
  value,
  label,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
  },
  iconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  value: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.primaryDark },
  label: { fontSize: FONTS.size.tiny, color: COLORS.gray.medium },
});
