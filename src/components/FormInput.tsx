import React from "react";
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
  style,
  ...rest
}) => {
  const hasError = touched && !!error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, hasError && styles.inputError]}>
        {leftIcon && (
          <Pressable
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            style={styles.iconButton}
          >
            <Ionicons name={leftIcon} size={22} color={COLORS.gray.medium} />
          </Pressable>
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.gray.medium}
          {...rest}
        />
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.iconButton}
          >
            <Ionicons name={rightIcon} size={22} color={COLORS.gray.medium} />
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
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.gray.darkest,
    marginBottom: DIMENSIONS.SPACING.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.secondary,
    borderRadius: DIMENSIONS.BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
  },
  input: {
    flex: 1,
    padding: DIMENSIONS.PADDING,
    fontSize: FONTS.size.medium,
    color: COLORS.gray.darkest,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONTS.size.small,
    marginTop: DIMENSIONS.SPACING.xs,
  },
  iconButton: {
    padding: DIMENSIONS.PADDING,
  },
});
