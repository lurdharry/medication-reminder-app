import React from "react";
import { AppStack } from "./AppStack";
import { AuthStack } from "./AuthStack";
import { useAuth } from "@/contexts/AuthContext";

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}
