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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useMedicationContext } from "../contexts/MedicationContext";

import { generateId } from "../utils/helpers";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { User } from "@/types";

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addUser } = useMedicationContext();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const handleComplete = async () => {
    if (!name.trim() || !age.trim()) {
      alert("Please enter your name and age");
      return;
    }

    const userData: User = {
      id: generateId(),
      name: name.trim(),
      age: parseInt(age),
      emergencyContacts: emergencyName.trim()
        ? [
            {
              id: generateId(),
              name: emergencyName.trim(),
              phone: emergencyPhone.trim(),
              relationship: "Emergency Contact",
              isPrimary: true,
              notifyOnMissedDose: true,
            },
          ]
        : [],
      dateOfBirth: new Date(),
      healthConditions: [],
      allergies: [],
    };

    addUser(userData);
    navigation.replace("MainTabs");
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
            <Text style={styles.title}>Welcome to MediRemind</Text>
            <Text style={styles.subtitle}>Let's set up your profile</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.gray.medium}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Age *</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor={COLORS.gray.medium}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Emergency Contact (Optional)</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Name</Text>
              <TextInput
                style={styles.input}
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder="e.g., John Doe"
                placeholderTextColor={COLORS.gray.medium}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                placeholder="e.g., +234 800 000 0000"
                placeholderTextColor={COLORS.gray.medium}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleComplete}>
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONTS.size.large,
    color: COLORS.gray.medium,
    marginTop: DIMENSIONS.SPACING.sm,
    textAlign: "center",
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
  divider: {
    height: 1,
    backgroundColor: COLORS.gray.lighter,
    marginVertical: DIMENSIONS.SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: "700",
    color: COLORS.gray.darkest,
    marginBottom: DIMENSIONS.SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: DIMENSIONS.BORDER_RADIUS.medium,
    padding: DIMENSIONS.PADDING_LARGE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DIMENSIONS.SPACING.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.size.large,
    fontWeight: "700",
  },
});
