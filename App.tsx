import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

import { AuthProvider } from "./src/contexts/AuthContext";
import { MedicationProvider } from "./src/contexts/MedicationContext";
import { COLORS } from "@/constants/colors";
import { RootNavigator } from "@/navigation/RootNavigator";

export default function App() {
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Notification permissions not granted");
      }
    }
    requestPermissions();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MedicationProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
            <RootNavigator />
          </NavigationContainer>
        </MedicationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
