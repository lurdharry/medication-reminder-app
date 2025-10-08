export const NOTIFICATION_SETTINGS = {
  // Channels (Android)
  CHANNELS: {
    MEDICATION_REMINDERS: "medication-reminders",
    URGENT_REMINDERS: "urgent-reminders",
    EMERGENCY: "emergency",
  },

  // Categories (iOS)
  CATEGORIES: {
    MEDICATION_REMINDER: "medication-reminder",
    MEDICATION_REMINDER_URGENT: "medication-reminder-urgent",
  },

  // Actions
  ACTIONS: {
    TAKE: "take",
    SNOOZE: "snooze",
    SKIP: "skip",
    EMERGENCY: "emergency",
  },

  // Escalation timing (in minutes)
  ESCALATION_LEVELS: {
    LEVEL_1: 5, // After 5 minutes
    LEVEL_2: 10, // After 10 minutes
    LEVEL_3: 15, // After 15 minutes - notify caregiver
  },

  // Default settings
  DEFAULT_SNOOZE_DURATION: 15, // minutes
  DEFAULT_QUIET_HOURS_START: "22:00",
  DEFAULT_QUIET_HOURS_END: "07:00",
};
