export const ADHERENCE_THRESHOLDS = {
  EXCELLENT: 95,
  GOOD: 85,
  FAIR: 75,
  POOR: 60,
  CRITICAL: 50,
};

export const VALIDATION = {
  // Medication
  MEDICATION_NAME_MIN_LENGTH: 2,
  MEDICATION_NAME_MAX_LENGTH: 100,
  DOSAGE_MIN: 0.001,
  DOSAGE_MAX: 10000,

  // User
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  AGE_MIN: 0,
  AGE_MAX: 120,
  PHONE_REGEX: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const DEFAULTS = {
  // User Preferences
  USER_PREFERENCES: {
    voiceEnabled: true,
    voiceSpeed: 0.75,
    voiceLanguage: "en-US",
    voicePersonality: "warm" as const,
    voiceGreeting: true,
    notificationsEnabled: true,
    reminderStyle: "progressive" as const,
    snoozeDuration: 15,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    vibrationEnabled: true,
    soundEnabled: true,
    ledFlashEnabled: false,
    aiConfirmBeforeAction: true,
    aiProvideMedicationInfo: true,
    aiCheckInteractions: true,
    aiPersonalizedSuggestions: true,
    storeConversationsLocally: true,
    enableCloudBackup: false,
    shareDataForResearch: false,
    theme: "light" as const,
    fontSize: "large" as const,
    highContrast: false,
    screenReaderOptimized: false,
    reduceMotion: false,
    hapticFeedback: true,
  },

  // Medication
  MEDICATION_UNIT: "mg",
  MEDICATION_COLOR: "#4A90E2",

  // Adherence
  ADHERENCE_RATE: 0,
  ADHERENCE_STREAK: 0,
};

export const RESEARCH_SETTINGS = {
  // Logging
  ENABLE_LOGGING: true,
  LOG_VOICE_INTERACTIONS: true,
  LOG_UI_INTERACTIONS: true,
  LOG_NOTIFICATION_RESPONSES: true,
  LOG_TASK_COMPLETION: true,

  // Metrics
  COLLECT_USABILITY_METRICS: true,
  COLLECT_ADHERENCE_METRICS: true,
  COLLECT_BEHAVIORAL_PATTERNS: true,

  // Export
  EXPORT_FORMAT: "json",
  ANONYMIZE_DATA: true,
  INCLUDE_TIMESTAMPS: true,

  // Study parameters
  STUDY_DURATION_DAYS: 30,
  MIN_PARTICIPANTS: 20,
  TARGET_AGE_RANGE: [65, 85],
};

export const MEDICATION_TIMES = [
  "06:00", // Early Morning
  "07:00", // Morning
  "08:00", // Breakfast
  "09:00", // Mid Morning
  "12:00", // Lunch
  "14:00", // Afternoon
  "17:00", // Before Dinner
  "18:00", // Dinner
  "20:00", // Evening
  "21:00", // Before Bed
  "22:00", // Night
];
