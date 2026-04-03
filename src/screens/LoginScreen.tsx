import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
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
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema } from "@/utils/validation/authValidation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

interface LoginFormValues {
  email: string;
  password: string;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { setAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const response = await authApi.login({
        email: values.email.trim(),
        password: values.password.trim(),
      });

      const { accessToken } = response.data.data;
      setAuthenticated(accessToken);
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Login Failed", message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleLogin}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.logoBg}>
                  <Ionicons name="medical" size={32} color={COLORS.primaryDark} />
                </View>
                <Text style={styles.title}>MediRemind</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </View>

              <View style={styles.form}>
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

                <Button
                  title="Sign In"
                  rightIcon="arrow-forward"
                  loading={isSubmitting}
                  onPress={() => handleSubmit()}
                  style={styles.button}
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <Pressable onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.footerLink}>Sign Up</Text>
                </Pressable>
              </View>
            </View>
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
  content: {
    flex: 1,
    padding: DIMENSIONS.PADDING_LARGE,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
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
