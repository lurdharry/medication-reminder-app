import React from "react";

import { MainTabs } from "./MainTabs";
import { AddMedicationScreen } from "@/screens/AddMedicationScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
