import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { DEFAULTS } from "../constants";
import { UserPreferences } from "../types";
import { STORAGE_KEYS } from "@/constants/storage";
import { Storage } from "@/services/storage";

interface MedicationContextType {
  userPreferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  getUserPreferences: () => UserPreferences;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

interface MedicationProviderProps {
  children: ReactNode;
}

export const MedicationProvider: React.FC<MedicationProviderProps> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const prefs = Storage.getObject<UserPreferences>(STORAGE_KEYS.PREFERENCES);
    return prefs || DEFAULTS.USER_PREFERENCES;
  });

  const updatePreferences = useCallback(
    (preferences: Partial<UserPreferences>) => {
      const updated: UserPreferences = {
        ...userPreferences,
        ...preferences,
      };
      Storage.setObject(STORAGE_KEYS.PREFERENCES, updated);
      setUserPreferences(updated);
    },
    [userPreferences]
  );

  const getUserPreferences = useCallback((): UserPreferences => {
    return userPreferences;
  }, [userPreferences]);

  const contextValue: MedicationContextType = {
    userPreferences,
    updatePreferences,
    getUserPreferences,
  };

  return <MedicationContext.Provider value={contextValue}>{children}</MedicationContext.Provider>;
};

export const useMedicationContext = (): MedicationContextType => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error("useMedicationContext must be used within MedicationProvider");
  }
  return context;
};

export default MedicationContext;
