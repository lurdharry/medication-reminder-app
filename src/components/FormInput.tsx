import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
  leftIcon?: IoniconsName;
  rightIcon?: IoniconsName;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  touched,
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  onFocus,
  onBlur,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = touched && !!error;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
      >
        {leftIcon && (
          <Pressable
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            style={styles.iconButton}
          >
            <Ionicons
              name={leftIcon}
              size={20}
              color={isFocused ? COLORS.primary : COLORS.gray.medium}
            />
          </Pressable>
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.gray.light}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconButton}
          >
            <Ionicons name={rightIcon} size={20} color={COLORS.gray.medium} />
          </Pressable>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DIMENSIONS.SPACING.lg,
  },
  label: {
    fontSize: FONTS.size.small,
    fontWeight: "600",
    color: COLORS.gray.medium,
    marginBottom: 6,
  },
  labelFocused: {
    color: COLORS.primary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: DIMENSIONS.PADDING,
    fontSize: FONTS.size.medium,
    color: COLORS.primaryDark,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.size.small,
    marginTop: 4,
  },
  iconButton: {
    paddingHorizontal: 12,
  },
});
