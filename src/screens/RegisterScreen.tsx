import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { authApi } from "@/services/api/authApi";
import { useAuth } from "@/contexts/AuthContext";

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setAuthenticated } = useAuth();
  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await authApi.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      });

      // Auto-login after registration
      const loginResponse = await authApi.login({
        email: form.email.trim(),
        password: form.password.trim(),
      });

      const { accessToken } = loginResponse.data.data;
      setAuthenticated(accessToken);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="medical" size={64} color={COLORS.primary} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join MediRemind today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.gray.medium}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray.medium}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.gray.medium}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color={COLORS.gray.medium}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={(text) =>
                  setForm({ ...form, confirmPassword: text })
                }
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.gray.medium}
                secureTextEntry={!showPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: DIMENSIONS.PADDING_LARGE,
  },
  header: {
    alignItems: "center",
    marginTop: DIMENSIONS.SPACING.xl,
    marginBottom: DIMENSIONS.SPACING.xxl,
  },
  title: {
    fontSize: FONTS.size.huge,
    fontWeight: "700",
    color: COLORS.gray.darkest,
    marginTop: DIMENSIONS.SPACING.lg,
  },
  subtitle: {
    fontSize: FONTS.size.large,
    color: COLORS.gray.medium,
    marginTop: DIMENSIONS.SPACING.sm,
  },
  form: {
    marginBottom: DIMENSIONS.SPACING.xl,
  },
  inputGroup: {
    marginBottom: DIMENSIONS.SPACING.lg,
  },
  label: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.gray.darkest,
    marginBottom: DIMENSIONS.SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: DIMENSIONS.BORDER_RADIUS.medium,
    padding: DIMENSIONS.PADDING,
    fontSize: FONTS.size.medium,
    color: COLORS.gray.darkest,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background.secondary,
    borderRadius: DIMENSIONS.BORDER_RADIUS.medium,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
  },
  passwordInput: {
    flex: 1,
    padding: DIMENSIONS.PADDING,
    fontSize: FONTS.size.medium,
    color: COLORS.gray.darkest,
  },
  eyeButton: {
    padding: DIMENSIONS.PADDING,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: DIMENSIONS.BORDER_RADIUS.medium,
    padding: DIMENSIONS.PADDING_LARGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DIMENSIONS.SPACING.sm,
    marginTop: DIMENSIONS.SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.size.large,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: DIMENSIONS.SPACING.xs,
  },
  footerText: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
  },
  footerLink: {
    fontSize: FONTS.size.medium,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
