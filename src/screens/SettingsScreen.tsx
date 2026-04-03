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
            <View style={[styles.sectionIconBg, { backgroundColor: COLORS.tint.blue }]}>
              <Ionicons name="person" size={16} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.sectionTitle}>Profile</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{user?.name || "—"}</Text>
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email || "—"}</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: COLORS.tint.peach }]}>
              <Ionicons name="notifications" size={16} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Reminders</Text>
              <Text style={styles.rowDescription}>Receive medication reminders</Text>
            </View>
            <Switch
              value={userPreferences.notificationsEnabled}
              onValueChange={(value) => handleToggle("notificationsEnabled", value)}
              trackColor={{ false: COLORS.gray.lighter, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Sound</Text>
              <Text style={styles.rowDescription}>Play notification sounds</Text>
            </View>
            <Switch
              value={userPreferences.soundEnabled}
              onValueChange={(value) => handleToggle("soundEnabled", value)}
              trackColor={{ false: COLORS.gray.lighter, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Voice */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: COLORS.tint.purple }]}>
              <Ionicons name="mic" size={16} color={COLORS.primaryDark} />
            </View>
            <Text style={styles.sectionTitle}>Voice Assistant</Text>
          </View>

          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Voice Enabled</Text>
              <Text style={styles.rowDescription}>Enable voice assistant features</Text>
            </View>
            <Switch
              value={userPreferences.voiceEnabled}
              onValueChange={(value) => handleToggle("voiceEnabled", value)}
              trackColor={{ false: COLORS.gray.lighter, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Text style={styles.versionText}>MediRemind v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: DIMENSIONS.PADDING, paddingVertical: 20 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  section: {
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  sectionIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.lightest,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowInfo: { flex: 1, marginRight: 16 },
  rowLabel: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
  },
  rowValue: {
    fontSize: FONTS.size.medium,
    fontWeight: "500",
    color: COLORS.primaryDark,
  },
  rowTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: "500",
    color: COLORS.primaryDark,
  },
  rowDescription: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: DIMENSIONS.PADDING,
    marginBottom: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.error + "30",
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
