export interface MedicationSchedule {
  id: string;
  time: string; // Format: "HH:MM" (e.g., "08:00", "14:30")
  taken: boolean;
  skipped: boolean;
  takenAt?: Date;
  skippedAt?: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string; // e.g., "10", "500"
  unit: "mg" | "ml" | "pills"; // e.g., "mg", "ml", "tablets"
  schedule: MedicationSchedule[];
  purpose: string; // What the medication is for
  instructions?: string; // Special instructions (e.g., "Take with food")
  startDate: Date;
  endDate?: Date;
  refillDate: Date;
  prescribedBy?: string; // Doctor's name
  pharmacyInfo?: string;
  sideEffects?: string[];
  interactions?: string[]; // Known drug interactions
  imageUri?: string; // Photo of the medication
  color?: string; // For UI categorization
  shape?: string; // Pill shape (round, oval, etc.)
  adherenceRate: number; // Calculated adherence percentage
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notifyOnMissedDose: boolean;
}

export interface HealthCondition {
  id: string;
  name: string;
  diagnosedDate: Date;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  dateOfBirth: Date;
  email?: string;
  phone?: string;
  address?: string;
  profileImageUri?: string;
  emergencyContacts: EmergencyContact[];
  healthConditions: HealthCondition[];
  allergies: string[];
  bloodType?: string;
  doctorName?: string;
  doctorPhone?: string;
  insuranceInfo?: string;
}

export interface UserPreferences {
  // Voice Settings
  voiceEnabled: boolean;
  voiceSpeed: number; // 0.5 to 1.5
  voiceLanguage: string; // e.g., "en-US"
  voicePersonality: "warm" | "professional" | "casual";
  voiceGreeting: boolean; // Greet user when opening app

  // Notification Settings
  notificationsEnabled: boolean;
  reminderStyle: "gentle" | "standard" | "progressive" | "urgent";
  snoozeDuration: number; // Minutes
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  ledFlashEnabled: boolean;

  // AI Settings
  aiConfirmBeforeAction: boolean;
  aiProvideMedicationInfo: boolean;
  aiCheckInteractions: boolean;
  aiPersonalizedSuggestions: boolean;

  // Privacy Settings
  storeConversationsLocally: boolean;
  enableCloudBackup: boolean;
  shareDataForResearch: boolean;

  // Display Settings
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large" | "extra-large";
  highContrast: boolean;

  // Accessibility
  screenReaderOptimized: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
}

export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface Intent {
  action: UserIntent;
  entities: {
    medicationName?: string;
    dosage?: string;
    unit?: string;
    time?: string;
    times?: string[];
    frequency?: string;
    purpose?: string;
    instructions?: string;
    reason?: string;
    urgency?: "low" | "medium" | "high" | "emergency";
    timeframe?: "today" | "tomorrow" | "this_week";
    [key: string]: any;
  };
  confidence: number;
}

export enum UserIntent {
  // Medication Management
  ADD_MEDICATION = "ADD_MEDICATION",
  UPDATE_MEDICATION = "UPDATE_MEDICATION",
  DELETE_MEDICATION = "DELETE_MEDICATION",

  // Dose Tracking
  MARK_TAKEN = "MARK_TAKEN",
  SKIP_DOSE = "SKIP_DOSE",
  SNOOZE_REMINDER = "SNOOZE_REMINDER",
  UNDO_ACTION = "UNDO_ACTION",

  // Information Queries
  QUERY_SCHEDULE = "QUERY_SCHEDULE",
  QUERY_INTERACTIONS = "QUERY_INTERACTIONS",
  QUERY_SIDE_EFFECTS = "QUERY_SIDE_EFFECTS",
  QUERY_MEDICATION_INFO = "QUERY_MEDICATION_INFO",

  // Adherence
  GET_ADHERENCE_REPORT = "GET_ADHERENCE_REPORT",
  GET_INSIGHTS = "GET_INSIGHTS",
  SET_REMINDER_PREFERENCE = "SET_REMINDER_PREFERENCE",

  // Emergency
  REPORT_SIDE_EFFECT = "REPORT_SIDE_EFFECT",
  REQUEST_HELP = "REQUEST_HELP",
  CALL_EMERGENCY = "CALL_EMERGENCY",

  // Conversational
  GENERAL_QUESTION = "GENERAL_QUESTION",
  CASUAL_CHAT = "CASUAL_CHAT",
  GREETING = "GREETING",
  ERROR = "ERROR",
}

export interface AIResponse {
  text: string;
  intent: Intent;
  shouldExecute: boolean;
  confidence: number;
  alternativeInterpretations?: Intent[];
}

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  text: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: Date;
  takenTime?: Date;
  status: "taken" | "missed" | "skipped";
  method: "notification" | "manual" | "voice";
  notes?: string;
}

export interface AdherenceStats {
  medicationId?: string;
  taken: number;
  missed: number;
  skipped: number;
  total: number;
  rate: number; // Percentage
  streak: number; // Consecutive days
  bestTimeOfDay?: string;
  worstTimeOfDay?: string;
}

export interface AdherenceInsights {
  // Temporal patterns
  bestTimeOfDay: string;
  worstTimeOfDay: string;
  bestDayOfWeek: string;

  // Patterns
  commonMissReasons: string[];
  impactOfEvents: { event: string; impact: number }[];

  // Recommendations
  suggestions: string[];

  // Trends
  adherenceTrend: "improving" | "declining" | "stable";
  improvementScore: number;
}

export interface BehaviorPattern {
  userId: string;
  medicationId: string;
  pattern: string;
  frequency: number;
  confidence: number;
  lastOccurrence: Date;
}

export interface NotificationData {
  medicationId: string;
  medicationName: string;
  scheduleId: string;
  dosage: string;
  unit: string;
  instructions?: string;
  snoozed?: boolean;
  escalationLevel?: number;
  notificationTime?: number;
  [key: string]: any;
}

export interface ScheduledNotification {
  id: string;
  medicationId: string;
  medicationName: string;
  time: Date;
  notificationId?: string;
}

export interface NotificationCallbacks {
  onMedicationTaken?: (medicationId: string) => Promise<void>;
  onMedicationSkipped?: (medicationId: string) => Promise<void>;
  onMedicationSnoozed?: (medicationId: string) => Promise<void>;
  onEmergencyAlert?: (medicationId: string, message: string) => Promise<void>;
}

export interface VoiceInteraction {
  id: string;
  userId: string;
  timestamp: Date;
  transcript: string;
  intent: string;
  confidence: number;
  executionTime: number; // milliseconds
  success: boolean;
  errorMessage?: string;
  context: {
    currentScreen: string;
    medicationsCount: number;
    pendingDoses: number;
  };
}

export interface UIInteraction {
  id: string;
  userId: string;
  timestamp: Date;
  action: string;
  screen: string;
  element: string;
  duration?: number;
  success: boolean;
}

export interface NotificationInteraction {
  id: string;
  userId: string;
  timestamp: Date;
  notificationId: string;
  medicationId: string;
  action: "take" | "snooze" | "skip" | "dismiss";
  responseTime: number;
  escalationLevel: number;
}

export interface TaskCompletion {
  id: string;
  userId: string;
  timestamp: Date;
  task: string; // e.g., "add_medication", "mark_taken"
  method: "voice" | "ui" | "notification";
  completionTime: number; // milliseconds
  errorCount: number;
  success: boolean;
}

export interface UsabilityMetrics {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime: Date;
  tasksAttempted: number;
  tasksCompleted: number;
  totalErrors: number;
  averageTaskTime: number;
  satisfactionScore?: number; // 1-5
  cognitiveLoad?: number;
  comments?: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendation: string;
  source?: string;
}

export interface MedicationInfo {
  name: string;
  genericName?: string;
  purpose: string;
  commonSideEffects: string[];
  seriousSideEffects: string[];
  instructions: string[];
  contraindications: string[];
  interactions: DrugInteraction[];
  foodInteractions?: string[];
  warnings: string[];
}

export interface TimeRange {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type SortOrder = "asc" | "desc";
export type SortBy = "name" | "time" | "adherence" | "date";

export interface MedicationContextType {
  // State
  medications: Medication[];
  user: User | null;
  userPreferences: UserPreferences;
  loading: boolean;

  addUser: (userData: User) => void;

  // Medication
  addMedication: (medication: Medication) => Promise<void>;
  updateMedication: (medication: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  getMedicationById: (id: string) => Medication | null;

  // Adherence
  getAdherenceRate: (medicationId?: string) => number;
  getAdherenceStats: (medicationId?: string) => AdherenceStats;

  // AI Insights
  getAIInsights: () => Promise<{
    insights: string[];
    suggestions: string[];
    encouragement: string;
  }>;

  // User Management
  updateUser: (user: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  getUserPreferences: () => Promise<UserPreferences>;

  // Utilities
  refreshMedications: () => Promise<void>;
  loadMedications: () => Promise<void>;
}
