export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: "Unable to connect. Please check your internet connection.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",

  // Voice
  MICROPHONE_PERMISSION_DENIED: "Microphone permission is required to use voice features.",
  VOICE_RECOGNITION_ERROR: "Could not understand. Please try again.",
  VOICE_SYNTHESIS_ERROR: "Could not speak response. Please check audio settings.",

  // AI
  AI_API_ERROR: "AI service temporarily unavailable. Please try again later.",
  AI_PROCESSING_ERROR: "Could not process your request. Please rephrase and try again.",

  // Notifications
  NOTIFICATION_PERMISSION_DENIED: "Notification permission is required for medication reminders.",
  NOTIFICATION_SCHEDULE_ERROR: "Could not schedule notification. Please try again.",

  // Data
  SAVE_ERROR: "Could not save data. Please try again.",
  LOAD_ERROR: "Could not load data. Please restart the app.",
  DELETE_ERROR: "Could not delete item. Please try again.",

  // Validation
  INVALID_MEDICATION_NAME: "Please enter a valid medication name.",
  INVALID_DOSAGE: "Please enter a valid dosage amount.",
  INVALID_TIME: "Please enter a valid time.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "Please enter a valid phone number.",
};

export const SUCCESS_MESSAGES = {
  MEDICATION_ADDED: "Medication added successfully!",
  MEDICATION_UPDATED: "Medication updated successfully!",
  MEDICATION_DELETED: "Medication deleted successfully!",
  DOSE_MARKED_TAKEN: "Dose marked as taken!",
  DOSE_SKIPPED: "Dose marked as skipped.",
  PREFERENCES_SAVED: "Preferences saved successfully!",
  REMINDER_SCHEDULED: "Reminder scheduled successfully!",
};
