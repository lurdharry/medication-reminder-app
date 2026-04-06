import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import { useMedications } from "@/hooks/useMedications";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useVoice } from "@/hooks/useVoice";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";
import { medicationSchema } from "@/utils/validation/medicationValidation";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";
import { MEDICATION_TIMES } from "@/constants";

interface MedicationFormValues {
  name: string;
  dosage: string;
  purpose: string;
  instructions: string;
}

export const AddMedicationScreen: React.FC = () => {
  const navigation = useAppNavigation();
  const route = useRoute();
  const { medicationId } = (route.params as { medicationId?: string }) || {};

  const { medications, addMedication, updateMedication } = useMedications();
  const { speak } = useVoice();

  const isEditing = !!medicationId;
  const existingMed = isEditing ? medications.find((m) => m.id === medicationId) : null;

  const [unit, setUnit] = useState<"mg" | "ml" | "pills">(existingMed?.unit || "mg");
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    existingMed?.schedule.map((s) => s.time) || []
  );
  const [imageUri, setImageUri] = useState<string | undefined>(existingMed?.imageUri);
  const [refillDate, setRefillDate] = useState<Date>(
    existingMed?.refillDate ? new Date(existingMed.refillDate) : new Date()
  );
  const [refillEnabled, setRefillEnabled] = useState(!!existingMed?.refillDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const initialValues: MedicationFormValues = {
    name: existingMed?.name || "",
    dosage: existingMed?.dosage?.toString() || "",
    purpose: existingMed?.purpose || "",
    instructions: existingMed?.instructions || "",
  };

  useEffect(() => {
    if (isEditing) {
      speak(`Editing ${existingMed?.name}`);
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
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async (values: MedicationFormValues) => {
    if (selectedTimes.length === 0) {
      Alert.alert("No Schedule", "Please select at least one time");
      return;
    }

    try {
      const medicationInput = {
        name: values.name.trim(),
        dosage: values.dosage,
        unit,
        purpose: values.purpose.trim(),
        instructions: values.instructions.trim(),
        imageUri,
        startDate: existingMed?.startDate || new Date(),
        refillDate: refillEnabled ? refillDate : undefined,
        schedule: selectedTimes.map((time) => ({ time })),
      };

      if (isEditing) {
        await updateMedication(medicationId, medicationInput);
        speak(`${values.name} updated`);
      } else {
        await addMedication(medicationInput);
        speak(`${values.name} added`);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save medication. Please try again.");
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Formik
        initialValues={initialValues}
        validationSchema={medicationSchema}
        onSubmit={handleSave}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable style={styles.headerBtn} onPress={handleCancel}>
                <Ionicons name="close" size={24} color={COLORS.gray.dark} />
              </Pressable>
              <Text style={styles.headerTitle}>
                {isEditing ? "Edit Medication" : "Add Medication"}
              </Text>
              <Pressable style={styles.headerBtn} onPress={() => handleSubmit()}>
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Image */}
              <Pressable style={styles.imagePicker} onPress={handlePickImage}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.medicationImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={28} color={COLORS.gray.medium} />
                    <Text style={styles.imageText}>Add Photo</Text>
                  </View>
                )}
              </Pressable>

              {/* Basic Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <FormInput
                  label="Medication Name *"
                  leftIcon="medical-outline"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  placeholder="e.g., Metformin"
                  autoCapitalize="words"
                  error={errors.name}
                  touched={touched.name}
                />

                <View style={styles.row}>
                  <View style={{ flex: 1.5, marginRight: 12 }}>
                    <FormInput
                      label="Dosage *"
                      value={values.dosage}
                      onChangeText={handleChange("dosage")}
                      onBlur={handleBlur("dosage")}
                      placeholder="500"
                      keyboardType="numeric"
                      error={errors.dosage}
                      touched={touched.dosage}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Unit</Text>
                    <View style={styles.unitSelector}>
                      {(["mg", "ml", "pills"] as const).map((u) => (
                        <Pressable
                          key={u}
                          style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                          onPress={() => setUnit(u)}
                        >
                          <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>
                            {u}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                <FormInput
                  label="Purpose"
                  leftIcon="information-circle-outline"
                  value={values.purpose}
                  onChangeText={handleChange("purpose")}
                  onBlur={handleBlur("purpose")}
                  placeholder="e.g., Diabetes management"
                  error={errors.purpose}
                  touched={touched.purpose}
                />

                <FormInput
                  label="Instructions"
                  leftIcon="document-text-outline"
                  value={values.instructions}
                  onChangeText={handleChange("instructions")}
                  onBlur={handleBlur("instructions")}
                  placeholder="e.g., Take with food"
                  multiline
                  numberOfLines={3}
                  error={errors.instructions}
                  touched={touched.instructions}
                />
              </View>

              {/* Schedule */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Schedule *</Text>
                <Text style={styles.sectionSubtitle}>Select times to take this medication</Text>

                <View style={styles.timeGrid}>
                  {MEDICATION_TIMES.map((time) => {
                    const isSelected = selectedTimes.includes(time);
                    return (
                      <Pressable
                        key={time}
                        style={[styles.timeBtn, isSelected && styles.timeBtnActive]}
                        onPress={() => handleSelectTime(time)}
                      >
                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                          size={20}
                          color={isSelected ? COLORS.primary : COLORS.gray.light}
                        />
                        <Text style={[styles.timeBtnText, isSelected && styles.timeBtnTextActive]}>
                          {time}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Refill */}
              <View style={styles.section}>
                <View style={styles.refillHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionTitle}>Refill Reminder</Text>
                    <Text style={styles.sectionSubtitle}>Get notified when it's time to refill</Text>
                  </View>
                  <Switch
                    value={refillEnabled}
                    onValueChange={setRefillEnabled}
                    trackColor={{ false: COLORS.gray.lighter, true: COLORS.accent }}
                    thumbColor={COLORS.white}
                  />
                </View>

                {refillEnabled && (
                  <Pressable style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    <Text style={styles.dateBtnText}>
                      {format(refillDate, "EEE, MMM dd, yyyy")}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.gray.light} />
                  </Pressable>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={refillDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(_event, selectedDate) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (selectedDate) setRefillDate(selectedDate);
                    }}
                  />
                )}
              </View>

              {/* Submit */}
              <View style={styles.submitSection}>
                <Button
                  title={isEditing ? "Update Medication" : "Add Medication"}
                  rightIcon="checkmark"
                  loading={isSubmitting}
                  onPress={() => handleSubmit()}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </Formik>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.lighter,
  },
  headerBtn: { padding: 8, minWidth: 50 },
  headerTitle: { fontSize: FONTS.size.large, fontWeight: "700", color: COLORS.primaryDark },
  saveText: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.accent, textAlign: "right" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Image
  imagePicker: {
    alignSelf: "center",
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: COLORS.gray.lightest,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    borderStyle: "dashed",
    marginVertical: 20,
  },
  medicationImage: { width: "100%", height: "100%" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: { marginTop: 4, fontSize: FONTS.size.tiny, color: COLORS.gray.medium },

  // Section
  section: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  sectionTitle: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primaryDark, marginBottom: 4 },
  sectionSubtitle: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginBottom: 12 },

  // Row
  row: { flexDirection: "row" },
  label: { fontSize: FONTS.size.small, fontWeight: "600", color: COLORS.gray.medium, marginBottom: 6 },

  // Unit
  unitSelector: { flexDirection: "row", gap: 6 },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.gray.lightest,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    alignItems: "center",
  },
  unitBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  unitBtnText: { fontSize: FONTS.size.small, fontWeight: "600", color: COLORS.gray.medium },
  unitBtnTextActive: { color: COLORS.white },

  // Time
  timeGrid: { gap: 8, marginTop: 4 },
  timeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    gap: 10,
  },
  timeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + "08" },
  timeBtnText: { fontSize: FONTS.size.medium, fontWeight: "500", color: COLORS.gray.medium },
  timeBtnTextActive: { color: COLORS.primaryDark },

  // Refill
  refillHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    marginTop: 12,
    gap: 10,
  },
  dateBtnText: { flex: 1, fontSize: FONTS.size.medium, fontWeight: "500", color: COLORS.primaryDark },

  // Submit
  submitSection: {
    paddingHorizontal: DIMENSIONS.PADDING,
    marginTop: 8,
  },
});
