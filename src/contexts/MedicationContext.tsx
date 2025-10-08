import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import medicationService from "../services/medicationService";
import aiVoiceAssistant from "../services/aiVoiceAssistant";
import { DEFAULTS } from "../constants";
import { Medication, User, UserPreferences, MedicationContextType, AdherenceStats } from "../types";
import { generateId } from "../utils/helpers";
import { STORAGE_KEYS } from "@/constants/storage";
import { Storage } from "@/services/storage";
import notificationService from "../services/notificationService";

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

interface MedicationProviderProps {
  children: ReactNode;
}

export const MedicationProvider: React.FC<MedicationProviderProps> = ({ children }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    DEFAULTS.USER_PREFERENCES
  );
  const [loading, setLoading] = useState(true);

  /**
   * Load all data on mount
   */
  useEffect(() => {
    loadAllData();
  }, []);

  /**
   * Check for new day and reset schedules
   */
  useEffect(() => {
    medicationService.checkAndResetIfNewDay();
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        if (medications.length === 0) return;

        // Check if we need to reschedule (once per day)
        const lastScheduled = Storage.getString("LAST_NOTIFICATION_SCHEDULE");
        const today = new Date().toDateString();

        if (lastScheduled !== today) {
          console.log("Rescheduling notifications for today...");

          // Cancel all existing notifications
          await notificationService.cancelAllNotifications();

          // Schedule for all medications
          for (const medication of medications) {
            await notificationService.scheduleAllReminders(medication);
          }

          Storage.setString("LAST_NOTIFICATION_SCHEDULE", today);
          console.log("Notifications scheduled successfully");
        }
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initializeNotifications();
  }, [medications]);

  const markMedicationTaken = useCallback(async (medicationId: string, scheduleId: string) => {
    try {
      await medicationService.markDoseTaken(medicationId, scheduleId);

      // Cancel escalation for this medication
      notificationService.cancelEscalation(medicationId);

      await loadMedications();
    } catch (error) {
      console.error("Error marking medication taken:", error);
      throw error;
    }
  }, []);

  /**
   * Load medications, user, and preferences
   */
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Load medications
      const meds = medicationService.getAllMedications();
      setMedications(meds);

      // Load user
      const userData = Storage.getObject<User>(STORAGE_KEYS.USER);
      setUser(userData);

      // Load preferences
      const prefs = Storage.getObject<UserPreferences>(STORAGE_KEYS.PREFERENCES);
      if (prefs) {
        setUserPreferences(prefs);
      } else {
        // Set defaults if none exist
        Storage.setObject(STORAGE_KEYS.PREFERENCES, DEFAULTS.USER_PREFERENCES);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  }, []);

  /**
   * Load medications
   */
  const loadMedications = useCallback(async () => {
    try {
      const meds = medicationService.getAllMedications();
      setMedications(meds);
    } catch (error) {
      console.error("Error loading medications:", error);
    }
  }, []);

  /**
   * Refresh medications (reload from storage)
   */
  const refreshMedications = useCallback(async () => {
    await loadMedications();
  }, [loadMedications]);

  /**
   * Add a new medication
   */
  const addMedication = useCallback(
    async (medication: Medication) => {
      try {
        await medicationService.addMedication(medication);
        await notificationService.scheduleAllReminders(medication);
        await loadMedications();
      } catch (error) {
        console.error("Error adding medication:", error);
        throw error;
      }
    },
    [loadMedications]
  );

  /**
   * Update existing medication
   */
  const updateMedication = useCallback(
    async (medication: Medication) => {
      try {
        await medicationService.updateMedication(medication);

        await notificationService.cancelMedicationReminders(medication.id);
        await notificationService.scheduleAllReminders(medication);

        await loadMedications();
      } catch (error) {
        console.error("Error updating medication:", error);
        throw error;
      }
    },
    [loadMedications]
  );

  /**
   * Delete medication
   */
  const deleteMedication = useCallback(
    async (id: string) => {
      try {
        await medicationService.deleteMedication(id);
        await loadMedications();
      } catch (error) {
        console.error("Error deleting medication:", error);
        throw error;
      }
    },
    [loadMedications]
  );

  /**
   * Get medication by ID
   */
  const getMedicationById = useCallback(
    (id: string): Medication | null => {
      return medications.find((m) => m.id === id) || null;
    },
    [medications]
  );

  /**
   * Get adherence rate for a specific medication or overall
   */
  const getAdherenceRate = useCallback((medicationId?: string): number => {
    const stats = medicationService.getAdherenceStats(medicationId);
    return stats.rate;
  }, []);

  /**
   * Get detailed adherence statistics
   */
  const getAdherenceStats = useCallback((medicationId?: string): AdherenceStats => {
    return medicationService.getAdherenceStats(medicationId);
  }, []);

  /**
   * Get AI insights about adherence
   */
  const getAIInsights = useCallback(async (): Promise<{
    insights: string[];
    suggestions: string[];
    encouragement: string;
  }> => {
    try {
      const stats = medicationService.getAdherenceStats();
      console.log({ stats });
      const adherenceData = {
        medications,
        adherenceRate: stats.rate,
        takenOnTime: stats.taken,
        missedDoses: stats.missed,
      };

      return await aiVoiceAssistant.analyzeAdherence(adherenceData);
    } catch (error) {
      console.error("Error getting AI insights:", error);
      return {
        insights: ["Keep up the good work with your medications!"],
        suggestions: ["Try setting reminders at consistent times"],
        encouragement: "You're doing great! Every dose you take matters.",
      };
    }
  }, [medications]);

  /**
   * Update user profile
   */
  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      try {
        const currentUser = user || {
          id: generateId(),
          name: "",
          age: 0,
          dateOfBirth: new Date(),
          emergencyContacts: [],
          healthConditions: [],
          allergies: [],
        };

        const updatedUser: User = {
          ...currentUser,
          ...userData,
        };

        Storage.setObject(STORAGE_KEYS.USER, updatedUser);
        setUser(updatedUser);
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    },
    [user]
  );

  const addUser = (userData: User) => {
    Storage.setObject(STORAGE_KEYS.USER, userData);
    setUser(userData);
  };

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      try {
        const updatedPreferences: UserPreferences = {
          ...userPreferences,
          ...preferences,
        };

        Storage.setObject(STORAGE_KEYS.PREFERENCES, updatedPreferences);
        setUserPreferences(updatedPreferences);
      } catch (error) {
        console.error("Error updating preferences:", error);
        throw error;
      }
    },
    [userPreferences]
  );

  /**
   * Get user preferences
   */
  const getUserPreferences = useCallback(async (): Promise<UserPreferences> => {
    return userPreferences;
  }, [userPreferences]);

  const snoozeMedication = useCallback(
    async (medicationId: string, medicationName: string, minutes: number = 15) => {
      try {
        await notificationService.snoozeMedication(medicationId, medicationName, minutes);
      } catch (error) {
        console.error("Error snoozing medication:", error);
        throw error;
      }
    },
    []
  );
  const contextValue: MedicationContextType = {
    // State
    medications,
    user,
    userPreferences,
    loading,

    // Medication
    addMedication,
    updateMedication,
    deleteMedication,
    getMedicationById,

    // Adherence
    getAdherenceRate,
    getAdherenceStats,

    // AI Insights
    getAIInsights,

    // User Management
    updateUser,
    updatePreferences,
    getUserPreferences,

    // Utilities
    refreshMedications,
    loadMedications,
    addUser,
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
