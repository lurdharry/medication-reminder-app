import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/theme";

interface TimeframeSelectorProps {
  selected: number;
  onSelect: (days: number) => void;
  options?: { value: number; label: string }[];
}

const defaultOptions = [
  { value: 7, label: "Week" },
  { value: 30, label: "Month" },
  { value: 90, label: "3 Months" },
];

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selected,
  onSelect,
  options = defaultOptions,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={[styles.button, selected === option.value && styles.buttonActive]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[styles.text, selected === option.value && styles.textActive]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.gray.lightest,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  text: { fontSize: FONTS.size.small, color: COLORS.gray.medium, fontWeight: "500" },
  textActive: { color: COLORS.white, fontWeight: "600" },
});
