import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

import { MedicationProvider } from "./src/contexts/MedicationContext";

import { COLORS } from "@/constants/colors";
import { Storage } from "@/services/storage";
import { STORAGE_KEYS } from "@/constants/storage";
import { RootNavigator } from "@/navigation/RootNavigator";

export default function App() {
  const [hasUser, setHasUser] = useState<boolean | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.warn("Notification permissions not granted");
        }

        const user = await Storage.getObject(STORAGE_KEYS.USER);
        setHasUser(!!user);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn("App preparation error:", e);
        setHasUser(false);
      }
    }

    prepare();
  }, []);

  if (hasUser === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <MedicationProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
          <RootNavigator hasUser={hasUser} />
        </NavigationContainer>
      </MedicationProvider>
    </SafeAreaProvider>
  );
}
