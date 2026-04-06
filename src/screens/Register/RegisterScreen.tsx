import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { authApi } from "@/services/api/authApi";
import { registerSchema } from "@/utils/validation/authValidation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

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
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      await authApi.register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password.trim(),
      });

      navigation.navigate("RegisterSuccess", { email: values.email.trim() });
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
                <View style={styles.logoBg}>
                  <Ionicons name="medical" size={32} color={COLORS.primaryDark} />
                </View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join MediRemind today</Text>
              </View>

              <View style={styles.form}>
                <FormInput
                  label="Full Name"
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
                  label="Email"
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
                  label="Password"
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
                  label="Confirm Password"
                  leftIcon="lock-closed-outline"
                  value={values.confirmPassword}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  placeholder="Confirm your password"
                  secureTextEntry={!showPassword}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />

                <Button
                  title="Create Account"
                  rightIcon="arrow-forward"
                  loading={isSubmitting}
                  onPress={() => handleSubmit()}
                  style={styles.button}
                />
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
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoBg: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.tint.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginTop: 16,
  },
  subtitle: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
    marginTop: 6,
  },
  form: {
    marginBottom: DIMENSIONS.SPACING.xl,
  },
  button: {
    marginTop: DIMENSIONS.SPACING.sm,
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
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
});
