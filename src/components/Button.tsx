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

const variantIconColors: Record<ButtonVariant, string> = {
  primary: COLORS.white,
  secondary: COLORS.gray.darkest,
  outline: COLORS.primary,
  danger: COLORS.white,
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
  const isDisabled = disabled || loading;
  const iconColor = variantIconColors[variant];

  return (
    <Pressable
      style={[
        styles.button,
        variantButtonStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {leftIcon && (
            <Ionicons name={leftIcon} size={20} color={iconColor} />
          )}
          <Text style={[styles.text, variantTextStyles[variant], textStyle]}>
            {title}
          </Text>
          {rightIcon && (
            <Ionicons name={rightIcon} size={20} color={iconColor} />
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: DIMENSIONS.PADDING_LARGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DIMENSIONS.SPACING.sm,
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    fontSize: FONTS.size.large,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.gray.light,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.gray.darkest,
  },
  outlineText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: COLORS.white,
  },
});

const variantButtonStyles: Record<ButtonVariant, ViewStyle> = {
  primary: styles.primaryButton,
  secondary: styles.secondaryButton,
  outline: styles.outlineButton,
  danger: styles.dangerButton,
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: styles.primaryText,
  secondary: styles.secondaryText,
  outline: styles.outlineText,
  danger: styles.dangerText,
};
