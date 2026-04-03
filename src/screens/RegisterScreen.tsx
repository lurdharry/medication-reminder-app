import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { authApi } from "@/services/api/authApi";
import { useAuth } from "@/contexts/AuthContext";
import { registerSchema } from "@/utils/validation/authValidation";
import { FormInput } from "@/components/FormInput";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      await authApi.register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password.trim(),
      });

      const loginResponse = await authApi.login({
        email: values.email.trim(),
        password: values.password.trim(),
      });

      const { accessToken } = loginResponse.data.data;
      setAuthenticated(accessToken);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Registration failed. Please try again.";
      Alert.alert("Registration Failed", message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.header}>
                <Ionicons name="medical" size={64} color={COLORS.primary} />
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join MediRemind today</Text>
              </View>

              <View style={styles.form}>
                <FormInput
                  label="Full Name *"
                  leftIcon="person-outline"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  error={errors.name}
                  touched={touched.name}
                />

                <FormInput
                  label="Email *"
                  leftIcon="mail-outline"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email}
                  touched={touched.email}
                />

                <FormInput
                  label="Password *"
                  leftIcon="lock-closed-outline"
                  rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  touched={touched.password}
                />

                <FormInput
                  label="Confirm Password *"
                  leftIcon="lock-closed-outline"
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  placeholder="Confirm your password"
                  secureTextEntry={!showPassword}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />

                <Pressable
                  style={[styles.button, isSubmitting && styles.buttonDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                    </>
                  )}
                </Pressable>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <Pressable onPress={() => navigation.goBack()}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </Formik>
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
