import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "@/constants/colors";
import { HomeScreen } from "@/screens/HomeScreen";
import { MedicationListScreen } from "@/screens/MedicationListScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { AdherenceAnalyticsScreen } from "@/screens/AdherenceAnalyticsScreen";
import { AIVoiceAssistantScreen } from "@/screens/AIVoiceAssistantScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export function MainTabs() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "help-outline";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Medications") {
            iconName = focused ? "medical" : "medical-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "Assistant") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray.medium,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray.lighter,
          height: 60 + bottom / 2,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Medications"
        component={MedicationListScreen}
        options={{ tabBarLabel: "Meds" }}
      />
      <Tab.Screen
        name="Analytics"
        component={AdherenceAnalyticsScreen}
        options={{ tabBarLabel: "Stats" }}
      />
      <Tab.Screen
        name="Assistant"
        component={AIVoiceAssistantScreen}
        options={{ tabBarLabel: "AI" }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
