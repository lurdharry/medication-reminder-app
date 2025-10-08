import React from "react";
import { AppStack } from "./AppStack";
import { AuthStack } from "./AuthStack";

export function RootNavigator({ hasUser }: { hasUser: boolean }) {
  return hasUser ? <AppStack /> : <AuthStack />;
}
