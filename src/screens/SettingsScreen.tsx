import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMedicationContext } from "../contexts/MedicationContext";
import { useInteractionLogger } from "../hooks/useInteractionLogger";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";

export const SettingsScreen: React.FC = () => {
  const { user, userPreferences, updateUser, updatePreferences } = useMedicationContext();
  const { exportLogsAsJSON, clearLogs, getLogSummary } = useInteractionLogger();

  const [userName, setUserName] = useState(user?.name || "");
  const [userAge, setUserAge] = useState(user?.age?.toString() || "");

  const handleSaveProfile = async () => {
    try {
      await updateUser({
        name: userName,
        age: parseInt(userAge) || 0,
      });
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Could not update profile");
    }
  };

  const handleToggle = async (key: keyof typeof userPreferences, value: boolean) => {
    await updatePreferences({ [key]: value });
  };

  const handleExportData = async () => {
    try {
      const summary = await getLogSummary();
      const json = await exportLogsAsJSON(true);

      Alert.alert(
        "Export Data",
        `Total interactions: ${
          summary?.totalVoiceInteractions || 0
        }\n\nData has been prepared. In production, this would be saved to a file.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Could not export data");
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure? This will delete all conversation and interaction logs.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearLogs();
            Alert.alert("Success", "History cleared");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.gray.medium}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={userAge}
              onChangeText={setUserAge}
              placeholder="Enter your age"
              placeholderTextColor={COLORS.gray.medium}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Voice Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mic" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Voice Settings</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Voice Enabled</Text>
              <Text style={styles.settingDescription}>Enable voice assistant features</Text>
            </View>
            <Switch
              value={userPreferences.voiceEnabled}
              onValueChange={(value) => handleToggle("voiceEnabled", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Voice Greeting</Text>
              <Text style={styles.settingDescription}>Speak welcome messages</Text>
            </View>
            <Switch
              value={userPreferences.voiceGreeting}
              onValueChange={(value) => handleToggle("voiceGreeting", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Speech Speed</Text>
              <Text style={styles.settingDescription}>
                Current: {userPreferences.voiceSpeed}x (Slower is easier to understand)
              </Text>
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications Enabled</Text>
              <Text style={styles.settingDescription}>Receive medication reminders</Text>
            </View>
            <Switch
              value={userPreferences.notificationsEnabled}
              onValueChange={(value) => handleToggle("notificationsEnabled", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sound</Text>
              <Text style={styles.settingDescription}>Play notification sounds</Text>
            </View>
            <Switch
              value={userPreferences.soundEnabled}
              onValueChange={(value) => handleToggle("soundEnabled", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Vibration</Text>
              <Text style={styles.settingDescription}>Vibrate on reminders</Text>
            </View>
            <Switch
              value={userPreferences.vibrationEnabled}
              onValueChange={(value) => handleToggle("vibrationEnabled", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Quiet Hours</Text>
              <Text style={styles.settingDescription}>
                {userPreferences.quietHoursStart} - {userPreferences.quietHoursEnd}
              </Text>
            </View>
            <Switch
              value={userPreferences.quietHoursEnabled}
              onValueChange={(value) => handleToggle("quietHoursEnabled", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>
        </View>

        {/* AI Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>AI Assistant</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Confirm Before Actions</Text>
              <Text style={styles.settingDescription}>Ask before executing commands</Text>
            </View>
            <Switch
              value={userPreferences.aiConfirmBeforeAction}
              onValueChange={(value) => handleToggle("aiConfirmBeforeAction", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Medication Information</Text>
              <Text style={styles.settingDescription}>Provide detailed drug info</Text>
            </View>
            <Switch
              value={userPreferences.aiProvideMedicationInfo}
              onValueChange={(value) => handleToggle("aiProvideMedicationInfo", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Check Drug Interactions</Text>
              <Text style={styles.settingDescription}>Warn about interactions</Text>
            </View>
            <Switch
              value={userPreferences.aiCheckInteractions}
              onValueChange={(value) => handleToggle("aiCheckInteractions", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="accessibility" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Accessibility</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>High Contrast</Text>
              <Text style={styles.settingDescription}>Increase color contrast</Text>
            </View>
            <Switch
              value={userPreferences.highContrast}
              onValueChange={(value) => handleToggle("highContrast", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Reduce Motion</Text>
              <Text style={styles.settingDescription}>Minimize animations</Text>
            </View>
            <Switch
              value={userPreferences.reduceMotion}
              onValueChange={(value) => handleToggle("reduceMotion", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>Vibrate on interactions</Text>
            </View>
            <Switch
              value={userPreferences.hapticFeedback}
              onValueChange={(value) => handleToggle("hapticFeedback", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Privacy & Data</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Store Conversations</Text>
              <Text style={styles.settingDescription}>Save chat history locally</Text>
            </View>
            <Switch
              value={userPreferences.storeConversationsLocally}
              onValueChange={(value) => handleToggle("storeConversationsLocally", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Share for Research</Text>
              <Text style={styles.settingDescription}>Help improve the app (anonymized)</Text>
            </View>
            <Switch
              value={userPreferences.shareDataForResearch}
              onValueChange={(value) => handleToggle("shareDataForResearch", value)}
              trackColor={{ false: COLORS.gray.light, true: COLORS.primary }}
            />
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <Ionicons name="download" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Export My Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearHistory}
          >
            <Ionicons name="trash" size={20} color={COLORS.error} />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Clear History</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>AI Medication Reminder v1.0.0</Text>
          <Text style={styles.aboutText}>For HCI Research</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: DIMENSIONS.PADDING, paddingVertical: 20 },
  title: { fontSize: FONTS.size.huge, fontWeight: "bold", color: COLORS.black },
  section: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 },
  sectionTitle: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.black },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: FONTS.size.medium,
    fontWeight: "500",
    color: COLORS.gray.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.gray.lightest,
    borderRadius: 12,
    padding: 12,
    fontSize: FONTS.size.medium,
    color: COLORS.black,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: { color: COLORS.white, fontSize: FONTS.size.medium, fontWeight: "600" },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.lightest,
  },
  settingInfo: { flex: 1, marginRight: 16 },
  settingTitle: { fontSize: FONTS.size.medium, fontWeight: "500", color: COLORS.black },
  settingDescription: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 4 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "10",
    marginTop: 12,
    gap: 8,
  },
  actionButtonText: { fontSize: FONTS.size.medium, fontWeight: "600", color: COLORS.primary },
  dangerButton: { backgroundColor: COLORS.error + "10" },
  dangerButtonText: { color: COLORS.error },
  aboutText: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 8,
    textAlign: "center",
  },
});
