import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";

export type MainTabsParamList = {
  Home: undefined;
  Medications: undefined;
  Analytics: undefined;
  Assistant: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  AddMedication: { medicationId?: string } | undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabsParamList>,
  NativeStackNavigationProp<AppStackParamList>
>;
