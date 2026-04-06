import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/theme";
import { Button } from "@/components/Button";

interface RouteParams {
  email: string;
}

export const RegisterSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { email } = (route.params as RouteParams) || {};

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <View style={styles.iconBg}>
          <Ionicons name="checkmark" size={48} color={COLORS.success} />
        </View>

        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.subtitle}>
          Your account has been successfully created. Please sign in with your credentials.
        </Text>

        {email && (
          <View style={styles.emailCard}>
            <Ionicons name="mail-outline" size={18} color={COLORS.gray.medium} />
            <Text style={styles.emailText}>{email}</Text>
          </View>
        )}

        <Button
          title="Go to Sign In"
          rightIcon="arrow-forward"
          onPress={() => navigation.navigate("Login")}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconBg: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.tint.green,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray.lightest,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 32,
  },
  emailText: {
    fontSize: FONTS.size.medium,
    fontWeight: "500",
    color: COLORS.primaryDark,
  },
  button: {
    alignSelf: "stretch",
  },
});
