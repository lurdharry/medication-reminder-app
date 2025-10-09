import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import { useMedicationContext } from "../contexts/MedicationContext";
import { useVoice } from "../hooks/useVoice";
import { Medication } from "../types";
import { generateId } from "../utils/helpers";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { MEDICATION_TIMES } from "@/constants";

export const AddMedicationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicationId } = (route.params as { medicationId?: string }) || {};

  const { medications, addMedication, updateMedication } = useMedicationContext();
  const { speak } = useVoice();

  const isEditing = !!medicationId;
  const existingMed = isEditing ? medications.find((m) => m.id === medicationId) : null;

  // Form state
  const [name, setName] = useState(existingMed?.name || "");
  const [dosage, setDosage] = useState(existingMed?.dosage.toString() || "");
  const [unit, setUnit] = useState<"mg" | "ml" | "pills">(existingMed?.unit || "mg");
  const [purpose, setPurpose] = useState(existingMed?.purpose || "");
  const [instructions, setInstructions] = useState(existingMed?.instructions || "");
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    existingMed?.schedule.map((s) => s.time) || []
  );
  const [imageUri, setImageUri] = useState<string | undefined>(existingMed?.imageUri);
  const [refillDate, setRefillDate] = useState<Date>(
    existingMed?.refillDate ? new Date(existingMed.refillDate) : new Date()
  );
  const [refillEnabled, setRefillEnabled] = useState(!!existingMed?.refillDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isEditing) {
      speak(`Editing ${existingMed?.name}`);
    } else {
      speak("Add new medication");
    }
  }, []);

  const handleSelectTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort()
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera roll permissions to add medication images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      speak("Image added");
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter medication name");
      return;
    }

    if (!dosage.trim() || isNaN(Number(dosage))) {
      Alert.alert("Invalid Dosage", "Please enter a valid dosage amount");
      return;
    }

    if (selectedTimes.length === 0) {
      Alert.alert("No Schedule", "Please select at least one time to take this medication");
      return;
    }

    try {
      const schedule = selectedTimes.map((time) => ({
        id: generateId(),
        time,
        taken: false,
        skipped: false,
      }));

      const medicationData: Medication = {
        id: isEditing ? medicationId : generateId(),
        name: name.trim(),
        dosage,
        unit,
        purpose: purpose.trim(),
        instructions: instructions.trim(),
        schedule,
        imageUri,
        startDate: existingMed?.startDate || new Date(),
        refillDate: refillEnabled ? refillDate : existingMed?.refillDate || new Date(),
        adherenceRate: existingMed?.adherenceRate || 100,
      };

      if (isEditing) {
        await updateMedication(medicationData);
        speak(`${name} updated successfully`);
      } else {
        await addMedication(medicationData);
        speak(`${name} added successfully`);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error saving medication:", error);
      Alert.alert("Error", "Failed to save medication. Please try again.");
    }
  };

  const handleCancel = () => {
    if (name || dosage || selectedTimes.length > 0) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCancel}
            accessibilityLabel="Cancel"
          >
            <Ionicons name="close" size={28} color={COLORS.gray.dark} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{isEditing ? "Edit Medication" : "Add Medication"}</Text>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleSave}
            accessibilityLabel="Save medication"
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={handlePickImage}
              accessibilityLabel="Add medication image"
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.medicationImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color={COLORS.gray.medium} />
                  <Text style={styles.imageText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Metformin"
                placeholderTextColor={COLORS.gray.medium}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel="Medication name"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1.5, marginRight: 12 }]}>
                <Text style={styles.label}>Dosage *</Text>
                <TextInput
                  style={styles.input}
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="500"
                  placeholderTextColor={COLORS.gray.medium}
                  keyboardType="numeric"
                  returnKeyType="next"
                  accessibilityLabel="Dosage amount"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Unit</Text>
                <View style={styles.unitSelector}>
                  {(["mg", "ml", "pills"] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitButton, unit === u && styles.unitButtonActive]}
                      onPress={() => setUnit(u)}
                      accessibilityLabel={`Unit: ${u}`}
                    >
                      <Text
                        style={[styles.unitButtonText, unit === u && styles.unitButtonTextActive]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Purpose</Text>
              <TextInput
                style={styles.input}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="e.g., Diabetes management"
                placeholderTextColor={COLORS.gray.medium}
                returnKeyType="next"
                accessibilityLabel="Medication purpose"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={instructions}
                onChangeText={setInstructions}
                placeholder="e.g., Take with food"
                placeholderTextColor={COLORS.gray.medium}
                multiline
                numberOfLines={3}
                returnKeyType="done"
                accessibilityLabel="Special instructions"
              />
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule *</Text>
            <Text style={styles.sectionSubtitle}>Select times to take this medication</Text>

            <View style={styles.timeGrid}>
              {MEDICATION_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    selectedTimes.includes(time) && styles.timeButtonActive,
                  ]}
                  onPress={() => handleSelectTime(time)}
                  accessibilityLabel={`${time} ${
                    selectedTimes.includes(time) ? "selected" : "not selected"
                  }`}
                >
                  <Ionicons
                    name={selectedTimes.includes(time) ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={selectedTimes.includes(time) ? COLORS.primary : COLORS.gray.medium}
                  />
                  <Text
                    style={[
                      styles.timeButtonText,
                      selectedTimes.includes(time) && styles.timeButtonTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Refill Reminder */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Refill Reminder</Text>
                <Text style={styles.sectionSubtitle}>Get notified when it's time to refill</Text>
              </View>
              <Switch
                value={refillEnabled}
                onValueChange={setRefillEnabled}
                trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
                thumbColor={COLORS.white}
                accessibilityLabel="Enable refill reminder"
              />
            </View>

            {refillEnabled && (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                accessibilityLabel="Select refill date"
              >
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
                <Text style={styles.dateButtonText}>
                  {refillDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray.medium} />
              </TouchableOpacity>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={refillDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setRefillDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DIMENSIONS.PADDING_LARGE,
    paddingVertical: DIMENSIONS.PADDING,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.light,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: FONTS.size.extraLarge,
    fontWeight: "700",
    color: COLORS.gray.darkest,
  },
  saveText: {
    fontSize: FONTS.size.large,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "right",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DIMENSIONS.PADDING_LARGE,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: DIMENSIONS.SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.light,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: COLORS.background.secondary,
    borderWidth: 2,
    borderColor: COLORS.gray.light,
    borderStyle: "dashed",
  },
  medicationImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: {
    marginTop: 8,
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: DIMENSIONS.PADDING_LARGE,
    marginTop: DIMENSIONS.PADDING,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONTS.size.large,
    fontWeight: "700",
    color: COLORS.gray.darkest,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: DIMENSIONS.PADDING_LARGE,
  },
  label: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.gray.darkest,
    marginBottom: 8,
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    marginBottom: DIMENSIONS.PADDING_LARGE,
  },
  unitSelector: {
    flexDirection: "row",
    gap: 8,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: DIMENSIONS.BORDER_RADIUS.small,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
    alignItems: "center",
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: FONTS.size.small,
    fontWeight: "600",
    color: COLORS.gray.dark,
  },
  unitButtonTextActive: {
    color: COLORS.white,
  },
  timeGrid: {
    gap: 12,
    marginTop: DIMENSIONS.PADDING,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: DIMENSIONS.PADDING,
    borderRadius: DIMENSIONS.BORDER_RADIUS.medium,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
    gap: 12,
  },
  timeButtonActive: {
    backgroundColor: COLORS.primary + "10",
    borderColor: COLORS.primary,
  },
  timeButtonText: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.gray.dark,
  },
  timeButtonTextActive: {
    color: COLORS.primary,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: DIMENSIONS.PADDING,
    borderRadius: DIMENSIONS.BORDER_RADIUS.medium,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
    marginTop: DIMENSIONS.PADDING,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.gray.darkest,
  },
});
