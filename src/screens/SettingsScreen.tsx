import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicationContext } from "@/contexts/MedicationContext";
import { aiApi } from "@/services/api/aiApi";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { userPreferences, updatePreferences } = useMedicationContext();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const handleClearConversation = () => {
    Alert.alert("Clear Conversation", "This will delete all AI chat history.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await aiApi.clearConversation();
          Alert.alert("Success", "Conversation history cleared");
        },
      },
    ]);
  };

  const handleToggle = (key: keyof typeof userPreferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Profile</Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Name</Text>
            <Text style={styles.profileValue}>{user?.name || "—"}</Text>
          </View>

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{user?.email || "—"}</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Reminders</Text>
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
        </View>

        {/* Voice */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mic" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Voice Assistant</Text>
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
        </View>

        {/* Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Data</Text>
          </View>

          <Pressable style={styles.actionRow} onPress={handleClearConversation}>
            <Ionicons name="chatbubbles-outline" size={20} color={COLORS.gray.dark} />
            <Text style={styles.actionText}>Clear AI Conversation</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray.medium} />
          </Pressable>
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        {/* Version */}
        <Text style={styles.versionText}>MediRemind v1.0.0</Text>
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
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: FONTS.size.large, fontWeight: "600", color: COLORS.black },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.lightest,
  },
  profileLabel: { fontSize: FONTS.size.medium, color: COLORS.gray.medium },
  profileValue: { fontSize: FONTS.size.medium, fontWeight: "500", color: COLORS.black },
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
  settingDescription: { fontSize: FONTS.size.small, color: COLORS.gray.medium, marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  actionText: {
    flex: 1,
    fontSize: FONTS.size.medium,
    color: COLORS.gray.dark,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
    backgroundColor: COLORS.error + "10",
    borderRadius: 16,
    padding: 16,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONTS.size.medium,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginBottom: 40,
  },
});
