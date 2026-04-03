import React from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  leftIcon?: IoniconsName;
  rightIcon?: IoniconsName;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: COLORS.primary, text: COLORS.white, border: COLORS.primary },
  secondary: { bg: COLORS.gray.light, text: COLORS.gray.darkest, border: COLORS.gray.light },
  outline: { bg: "transparent", text: COLORS.primary, border: COLORS.primary },
  danger: { bg: COLORS.error, text: COLORS.white, border: COLORS.error },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  textStyle,
  ...rest
}) => {
  const colors = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        variant === "outline" && styles.outlineBorder,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <>
          {leftIcon && (
            <Ionicons name={leftIcon} size={20} color={colors.text} />
          )}
          <Text style={[styles.text, { color: colors.text }, textStyle]}>
            {title}
          </Text>
          {rightIcon && (
            <Ionicons name={rightIcon} size={20} color={colors.text} />
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: DIMENSIONS.BORDER_RADIUS.medium,
    padding: DIMENSIONS.PADDING_LARGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DIMENSIONS.SPACING.sm,
  },
  outlineBorder: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    fontSize: FONTS.size.large,
    fontWeight: "700",
  },
});
