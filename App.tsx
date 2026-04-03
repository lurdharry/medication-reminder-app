import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

import { MedicationProvider } from "./src/contexts/MedicationContext";
import { COLORS } from "@/constants/colors";
import { RootNavigator } from "@/navigation/RootNavigator";
import { TokenManager } from "@/services/api";
import { userApi } from "@/services/api/userApi";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("Notification permissions not granted");
        }

        const token = TokenManager.getToken();
        if (token) {
          // Validate token by calling the API
          await userApi.getProfile();
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        // Token invalid or expired
        TokenManager.clearToken();
        setIsAuthenticated(false);
      }
    }

    prepare();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <MedicationProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
          <RootNavigator hasUser={isAuthenticated} />
        </NavigationContainer>
      </MedicationProvider>
    </SafeAreaProvider>
  );
}
