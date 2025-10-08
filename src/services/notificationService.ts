import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import medicationService from "./medicationService";

import {
  Medication,
  ScheduledNotification,
  NotificationCallbacks,
  UserPreferences,
} from "../types";
import { generateId, isTimeInRange } from "../utils/helpers";
import { NOTIFICATION_SETTINGS } from "@/constants/notification";
import { STORAGE_KEYS } from "@/constants/storage";
import { Storage } from "@/services/storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private scheduledNotifications: ScheduledNotification[] = [];
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;
  private escalationTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private callbacks: NotificationCallbacks = {};
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize notification service
   */
  private async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          console.error("Notification permissions not granted");
          return;
        }
      }

      // Setup channels for Android
      if (Platform.OS === "android") {
        await this.setupAndroidChannels();
      }

      // Setup notification categories
      await this.setupNotificationCategories();

      // Setup event handlers
      this.setupNotificationHandlers();

      // Load previously scheduled notifications
      await this.loadScheduledNotifications();

      this.isInitialized = true;
      console.log("NotificationService initialized");
    } catch (error) {
      console.error("Failed to initialize NotificationService:", error);
    }
  }

  /**
   * Setup Android notification channels
   */
  private async setupAndroidChannels() {
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_SETTINGS.CHANNELS.MEDICATION_REMINDERS,
      {
        name: "Medication Reminders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4A90E2",
        sound: "default",
      }
    );

    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_SETTINGS.CHANNELS.URGENT_REMINDERS,
      {
        name: "Urgent Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 500, 500],
        lightColor: "#FF0000",
        sound: "default",
      }
    );

    await Notifications.setNotificationChannelAsync(NOTIFICATION_SETTINGS.CHANNELS.EMERGENCY, {
      name: "Emergency Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 1000, 500, 1000],
      lightColor: "#FF0000",
      sound: "default",
    });
  }

  /**
   * Setup notification categories with actions
   */
  private async setupNotificationCategories() {
    await Notifications.setNotificationCategoryAsync(
      NOTIFICATION_SETTINGS.CATEGORIES.MEDICATION_REMINDER,
      [
        {
          identifier: NOTIFICATION_SETTINGS.ACTIONS.TAKE,
          buttonTitle: "Take",
          options: { opensAppToForeground: false },
        },
        {
          identifier: NOTIFICATION_SETTINGS.ACTIONS.SNOOZE,
          buttonTitle: "Snooze 15 min",
          options: { opensAppToForeground: false },
        },
        {
          identifier: NOTIFICATION_SETTINGS.ACTIONS.SKIP,
          buttonTitle: "Skip",
          options: { opensAppToForeground: false, isDestructive: true },
        },
      ]
    );

    await Notifications.setNotificationCategoryAsync(
      NOTIFICATION_SETTINGS.CATEGORIES.MEDICATION_REMINDER_URGENT,
      [
        {
          identifier: NOTIFICATION_SETTINGS.ACTIONS.TAKE,
          buttonTitle: "Take Now",
          options: { opensAppToForeground: true },
        },
        {
          identifier: NOTIFICATION_SETTINGS.ACTIONS.EMERGENCY,
          buttonTitle: "Call for Help",
          options: { opensAppToForeground: true, isDestructive: true },
        },
      ]
    );
  }

  /**
   * Setup notification event handlers
   */
  private setupNotificationHandlers() {
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived
    );

    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse
    );
  }

  /**
   * Handle notification received (app in foreground)
   */
  private handleNotificationReceived = (notification: Notifications.Notification) => {
    console.log("Notification received:", notification);

    const { categoryIdentifier } = notification.request.content;
    const data = notification.request.content.data as any;

    if (
      categoryIdentifier === NOTIFICATION_SETTINGS.CATEGORIES.MEDICATION_REMINDER &&
      data?.medicationId
    ) {
      this.startEscalation(data.medicationId, data.medicationName);
    }
  };

  /**
   * Handle notification response (user interaction)
   */
  private handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
    console.log("Notification response:", response);

    const { actionIdentifier } = response;
    const data = response.notification.request.content.data as any;
    const { medicationId, medicationName, scheduleId } = data || {};

    if (!medicationId || !scheduleId) return;

    // Cancel escalation
    this.cancelEscalation(medicationId);

    switch (actionIdentifier) {
      case NOTIFICATION_SETTINGS.ACTIONS.TAKE:
        await this.handleMedicationTaken(medicationId, scheduleId, medicationName);
        break;

      case NOTIFICATION_SETTINGS.ACTIONS.SNOOZE:
        await this.handleMedicationSnoozed(medicationId, medicationName);
        break;

      case NOTIFICATION_SETTINGS.ACTIONS.SKIP:
        await this.handleMedicationSkipped(medicationId, scheduleId, medicationName);
        break;

      case NOTIFICATION_SETTINGS.ACTIONS.EMERGENCY:
        await this.handleEmergencyAction(medicationId, medicationName);
        break;

      default:
        console.log("Notification tapped - opening app");
        break;
    }
  };

  /**
   * Schedule all reminders for a medication
   */
  public async scheduleAllReminders(medication: Medication): Promise<void> {
    try {
      // Cancel existing reminders
      await this.cancelMedicationReminders(medication.id);

      const today = new Date();

      for (const schedule of medication.schedule) {
        // Skip if already taken or skipped
        if (schedule.taken || schedule.skipped) continue;

        const [hours, minutes] = schedule.time.split(":").map(Number);
        const reminderTime = new Date(today);
        reminderTime.setHours(hours, minutes, 0, 0);

        // If time passed, schedule for tomorrow
        if (reminderTime <= new Date()) {
          reminderTime.setDate(reminderTime.getDate() + 1);
        }

        // Check quiet hours
        const preferences = Storage.getObject<UserPreferences>(STORAGE_KEYS.PREFERENCES);
        if (
          preferences?.quietHoursEnabled &&
          isTimeInRange(schedule.time, preferences.quietHoursStart, preferences.quietHoursEnd)
        ) {
          console.log(`Skipping ${medication.name} at ${schedule.time} - quiet hours`);
          continue;
        }

        await this.scheduleReminder(medication, reminderTime, schedule.id);
      }

      console.log(`Scheduled all reminders for ${medication.name}`);
    } catch (error) {
      console.error("Error scheduling reminders:", error);
    }
  }

  /**
   * Schedule a single reminder
   */
  private async scheduleReminder(
    medication: Medication,
    time: Date,
    scheduleId: string
  ): Promise<string | null> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊 Medication Reminder",
          body: `Time to take ${medication.name} (${medication.dosage}${medication.unit})`,
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            scheduleId,
            dosage: medication.dosage,
            unit: medication.unit,
            instructions: medication.instructions,
          },
          sound: true,
          categoryIdentifier: NOTIFICATION_SETTINGS.CATEGORIES.MEDICATION_REMINDER,
          ...(Platform.OS === "android" && {
            channelId: NOTIFICATION_SETTINGS.CHANNELS.MEDICATION_REMINDERS,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: time,
        },
      });

      const scheduled: ScheduledNotification = {
        id: generateId(),
        medicationId: medication.id,
        medicationName: medication.name,
        time,
        notificationId,
      };

      this.scheduledNotifications.push(scheduled);
      await this.saveScheduledNotifications();

      return notificationId;
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      return null;
    }
  }

  /**
   * Cancel all reminders for a medication
   */
  public async cancelMedicationReminders(medicationId: string): Promise<void> {
    try {
      const notifications = this.scheduledNotifications.filter(
        (n) => n.medicationId === medicationId
      );

      for (const notif of notifications) {
        if (notif.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(notif.notificationId);
        }
      }

      this.scheduledNotifications = this.scheduledNotifications.filter(
        (n) => n.medicationId !== medicationId
      );

      await this.saveScheduledNotifications();
      this.cancelEscalation(medicationId);

      console.log(`Cancelled all reminders for medication ${medicationId}`);
    } catch (error) {
      console.error("Error cancelling reminders:", error);
    }
  }

  /**
   * Snooze a medication
   */
  public async snoozeMedication(
    medicationId: string,
    medicationName: string,
    minutes: number = NOTIFICATION_SETTINGS.DEFAULT_SNOOZE_DURATION
  ): Promise<void> {
    try {
      const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💊 Snoozed Reminder",
          body: `Time to take ${medicationName}`,
          data: { medicationId, medicationName, snoozed: true },
          sound: true,
          categoryIdentifier: NOTIFICATION_SETTINGS.CATEGORIES.MEDICATION_REMINDER,
          ...(Platform.OS === "android" && {
            channelId: NOTIFICATION_SETTINGS.CHANNELS.MEDICATION_REMINDERS,
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: snoozeTime,
        },
      });

      console.log(`Snoozed ${medicationName} for ${minutes} minutes`);
      this.cancelEscalation(medicationId);
    } catch (error) {
      console.error("Error snoozing medication:", error);
    }
  }

  /**
   * Start escalation sequence
   */
  private startEscalation(medicationId: string, medicationName: string): void {
    this.cancelEscalation(medicationId);

    const level1 = setTimeout(async () => {
      await this.sendEscalatedReminder(medicationId, medicationName, 1);
    }, NOTIFICATION_SETTINGS.ESCALATION_LEVELS.LEVEL_1 * 60 * 1000);

    const level2 = setTimeout(async () => {
      await this.sendEscalatedReminder(medicationId, medicationName, 2);
    }, NOTIFICATION_SETTINGS.ESCALATION_LEVELS.LEVEL_2 * 60 * 1000);

    const level3 = setTimeout(async () => {
      await this.sendEscalatedReminder(medicationId, medicationName, 3);
    }, NOTIFICATION_SETTINGS.ESCALATION_LEVELS.LEVEL_3 * 60 * 1000);

    this.escalationTimeouts.set(`${medicationId}_1`, level1);
    this.escalationTimeouts.set(`${medicationId}_2`, level2);
    this.escalationTimeouts.set(`${medicationId}_3`, level3);
  }

  /**
   * Cancel escalation
   */
  public cancelEscalation(medicationId: string): void {
    for (let i = 1; i <= 3; i++) {
      const key = `${medicationId}_${i}`;
      const timeout = this.escalationTimeouts.get(key);
      if (timeout) {
        clearTimeout(timeout);
        this.escalationTimeouts.delete(key);
      }
    }
  }

  /**
   * Send escalated reminder
   */
  private async sendEscalatedReminder(
    medicationId: string,
    medicationName: string,
    level: number
  ): Promise<void> {
    const messages = [
      { title: "⚠️ Medication Overdue", body: `${medicationName} is 5 minutes overdue` },
      { title: "🚨 URGENT", body: `${medicationName} is 10 minutes overdue!` },
      { title: "🆘 Emergency", body: `${medicationName} critically overdue` },
    ];

    const message = messages[level - 1];

    await Notifications.scheduleNotificationAsync({
      content: {
        ...message,
        data: { medicationId, medicationName, escalationLevel: level },
        sound: true,
        categoryIdentifier:
          level >= 2
            ? NOTIFICATION_SETTINGS.CATEGORIES.MEDICATION_REMINDER_URGENT
            : NOTIFICATION_SETTINGS.CATEGORIES.MEDICATION_REMINDER,
        ...(Platform.OS === "android" && {
          channelId:
            level >= 2
              ? NOTIFICATION_SETTINGS.CHANNELS.URGENT_REMINDERS
              : NOTIFICATION_SETTINGS.CHANNELS.MEDICATION_REMINDERS,
        }),
      },
      trigger: null,
    });
  }

  /**
   * Handle medication taken
   */
  private async handleMedicationTaken(
    medicationId: string,
    scheduleId: string,
    medicationName: string
  ): Promise<void> {
    await medicationService.markDoseTaken(medicationId, scheduleId);

    if (this.callbacks.onMedicationTaken) {
      await this.callbacks.onMedicationTaken(medicationId);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "✅ Great Job!",
        body: `${medicationName} recorded as taken`,
        sound: false,
      },
      trigger: null,
    });
  }

  /**
   * Handle medication snoozed
   */
  private async handleMedicationSnoozed(
    medicationId: string,
    medicationName: string
  ): Promise<void> {
    await this.snoozeMedication(medicationId, medicationName);

    if (this.callbacks.onMedicationSnoozed) {
      await this.callbacks.onMedicationSnoozed(medicationId);
    }
  }

  /**
   * Handle medication skipped
   */
  private async handleMedicationSkipped(
    medicationId: string,
    scheduleId: string,
    medicationName: string
  ): Promise<void> {
    await medicationService.markDoseSkipped(medicationId, scheduleId);

    if (this.callbacks.onMedicationSkipped) {
      await this.callbacks.onMedicationSkipped(medicationId);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏭️ Dose Skipped",
        body: `${medicationName} marked as skipped`,
        sound: false,
      },
      trigger: null,
    });
  }

  /**
   * Handle emergency action
   */
  private async handleEmergencyAction(medicationId: string, medicationName: string): Promise<void> {
    console.log("Emergency action triggered");

    if (this.callbacks.onEmergencyAlert) {
      await this.callbacks.onEmergencyAlert(medicationId, "Emergency button pressed");
    }
  }

  /**
   * Save scheduled notifications
   */
  private async saveScheduledNotifications(): Promise<void> {
    Storage.setObject(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS, this.scheduledNotifications);
  }

  /**
   * Load scheduled notifications
   */
  public async loadScheduledNotifications(): Promise<void> {
    const stored = Storage.getObject<ScheduledNotification[]>(STORAGE_KEYS.SCHEDULED_NOTIFICATIONS);
    if (stored) {
      this.scheduledNotifications = stored;
      console.log(`Loaded ${stored.length} scheduled notifications`);
    }
  }

  /**
   * Cancel all notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.scheduledNotifications = [];
    await this.saveScheduledNotifications();
    this.escalationTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.escalationTimeouts.clear();
  }
}

export default new NotificationService();
