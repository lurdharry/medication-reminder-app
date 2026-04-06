import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OnboardingScreen } from "@/screens/Onboarding/OnboardingScreen";
import { LoginScreen } from "@/screens/Login/LoginScreen";
import { RegisterScreen } from "@/screens/Register/RegisterScreen";
import { RegisterSuccessScreen } from "@/screens/RegisterSuccess/RegisterSuccessScreen";

const Stack = createNativeStackNavigator();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
    </Stack.Navigator>
  );
}
