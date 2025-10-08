import { useCallback } from "react";

import {
  VoiceInteraction,
  UIInteraction,
  NotificationInteraction,
  TaskCompletion,
  UsabilityMetrics,
} from "../types";
import { generateId } from "../utils/helpers";
import { RESEARCH_SETTINGS } from "@/constants";
import { STORAGE_KEYS } from "@/constants/storage";
import { Storage } from "@/services/storage";

const isLoggingEnabled = RESEARCH_SETTINGS.ENABLE_LOGGING;

/**
 * Hook for logging all user interactions for research purposes
 */
export const useInteractionLogger = () => {
  /**
   * Log a voice interaction
   */
  const logVoiceInteraction = useCallback(
    async (data: {
      userId: string;
      transcript: string;
      intent: string;
      confidence: number;
      executionTime: number;
      success: boolean;
      errorMessage?: string;
      context: {
        currentScreen: string;
        medicationsCount: number;
        pendingDoses: number;
      };
    }) => {
      if (!isLoggingEnabled || !RESEARCH_SETTINGS.LOG_VOICE_INTERACTIONS) return;

      try {
        const interaction: VoiceInteraction = {
          id: generateId(),
          userId: data.userId,
          timestamp: new Date(),
          transcript: data.transcript,
          intent: data.intent,
          confidence: data.confidence,
          executionTime: data.executionTime,
          success: data.success,
          errorMessage: data.errorMessage,
          context: data.context,
        };

        const logs = Storage.getObject<VoiceInteraction[]>(STORAGE_KEYS.INTERACTION_LOGS) || [];
        logs.push(interaction);

        // Keep only last 1000 interactions
        const trimmedLogs = logs.slice(-1000);
        Storage.setObject(STORAGE_KEYS.INTERACTION_LOGS, trimmedLogs);

        console.log("Voice interaction logged:", interaction.id);
      } catch (error) {
        console.error("Error logging voice interaction:", error);
      }
    },
    [isLoggingEnabled]
  );

  /**
   * Log a UI interaction (button clicks, navigation, etc.)
   */
  const logUIInteraction = useCallback(
    async (data: {
      userId: string;
      action: string;
      screen: string;
      element: string;
      duration?: number;
      success: boolean;
    }) => {
      if (!isLoggingEnabled || !RESEARCH_SETTINGS.LOG_UI_INTERACTIONS) return;

      try {
        const interaction: UIInteraction = {
          id: generateId(),
          userId: data.userId,
          timestamp: new Date(),
          action: data.action,
          screen: data.screen,
          element: data.element,
          duration: data.duration,
          success: data.success,
        };

        const logs = Storage.getObject<UIInteraction[]>("@ui_interactions") || [];
        logs.push(interaction);

        const trimmedLogs = logs.slice(-1000);
        Storage.setObject("@ui_interactions", trimmedLogs);

        console.log("UI interaction logged:", interaction.id);
      } catch (error) {
        console.error("Error logging UI interaction:", error);
      }
    },
    [isLoggingEnabled]
  );

  /**
   * Log a notification interaction
   */
  const logNotificationInteraction = useCallback(
    async (data: {
      userId: string;
      notificationId: string;
      medicationId: string;
      action: "take" | "snooze" | "skip" | "dismiss";
      responseTime: number;
      escalationLevel: number;
    }) => {
      if (!isLoggingEnabled || !RESEARCH_SETTINGS.LOG_NOTIFICATION_RESPONSES) return;

      try {
        const interaction: NotificationInteraction = {
          id: generateId(),
          userId: data.userId,
          timestamp: new Date(),
          notificationId: data.notificationId,
          medicationId: data.medicationId,
          action: data.action,
          responseTime: data.responseTime,
          escalationLevel: data.escalationLevel,
        };

        const logs =
          Storage.getObject<NotificationInteraction[]>("@notification_interactions") || [];
        logs.push(interaction);

        const trimmedLogs = logs.slice(-1000);
        Storage.setObject("@notification_interactions", trimmedLogs);

        console.log("Notification interaction logged:", interaction.id);
      } catch (error) {
        console.error("Error logging notification interaction:", error);
      }
    },
    [isLoggingEnabled]
  );

  /**
   * Log task completion
   */
  const logTaskCompletion = useCallback(
    async (data: {
      userId: string;
      task: string;
      method: "voice" | "ui" | "notification";
      completionTime: number;
      errorCount: number;
      success: boolean;
    }) => {
      if (!isLoggingEnabled || !RESEARCH_SETTINGS.LOG_TASK_COMPLETION) return;

      try {
        const taskLog: TaskCompletion = {
          id: generateId(),
          userId: data.userId,
          timestamp: new Date(),
          task: data.task,
          method: data.method,
          completionTime: data.completionTime,
          errorCount: data.errorCount,
          success: data.success,
        };

        const logs = Storage.getObject<TaskCompletion[]>("@task_completions") || [];
        logs.push(taskLog);

        const trimmedLogs = logs.slice(-500);
        Storage.setObject("@task_completions", trimmedLogs);

        console.log("Task completion logged:", taskLog.id);
      } catch (error) {
        console.error("Error logging task completion:", error);
      }
    },
    [isLoggingEnabled]
  );

  /**
   * Log usability metrics
   */
  const logUsabilityMetrics = useCallback(
    async (metrics: Omit<UsabilityMetrics, "sessionId">) => {
      if (!isLoggingEnabled || !RESEARCH_SETTINGS.COLLECT_USABILITY_METRICS) return;

      try {
        const metricsLog: UsabilityMetrics = {
          ...metrics,
          sessionId: generateId(),
        };

        const allMetrics =
          Storage.getObject<UsabilityMetrics[]>(STORAGE_KEYS.USABILITY_METRICS) || [];
        allMetrics.push(metricsLog);

        Storage.setObject(STORAGE_KEYS.USABILITY_METRICS, allMetrics);

        console.log("Usability metrics logged:", metricsLog.sessionId);
      } catch (error) {
        console.error("Error logging usability metrics:", error);
      }
    },
    [isLoggingEnabled]
  );

  /**
   * Export all interaction logs
   */
  const exportLogs = useCallback(async (): Promise<{
    voiceInteractions: VoiceInteraction[];
    uiInteractions: UIInteraction[];
    notificationInteractions: NotificationInteraction[];
    taskCompletions: TaskCompletion[];
    usabilityMetrics: UsabilityMetrics[];
  }> => {
    try {
      return {
        voiceInteractions:
          Storage.getObject<VoiceInteraction[]>(STORAGE_KEYS.INTERACTION_LOGS) || [],
        uiInteractions: Storage.getObject<UIInteraction[]>("@ui_interactions") || [],
        notificationInteractions:
          Storage.getObject<NotificationInteraction[]>("@notification_interactions") || [],
        taskCompletions: Storage.getObject<TaskCompletion[]>("@task_completions") || [],
        usabilityMetrics:
          Storage.getObject<UsabilityMetrics[]>(STORAGE_KEYS.USABILITY_METRICS) || [],
      };
    } catch (error) {
      console.error("Error exporting logs:", error);
      return {
        voiceInteractions: [],
        uiInteractions: [],
        notificationInteractions: [],
        taskCompletions: [],
        usabilityMetrics: [],
      };
    }
  }, []);

  /**
   * Export logs as JSON string
   */
  const exportLogsAsJSON = useCallback(
    async (anonymize: boolean = true): Promise<string> => {
      try {
        const logs = await exportLogs();

        if (anonymize) {
          // Remove personally identifiable information
          return JSON.stringify(
            {
              ...logs,
              voiceInteractions: logs.voiceInteractions.map((log) => ({
                ...log,
                userId: "anonymized",
                transcript: "[REDACTED]",
              })),
              uiInteractions: logs.uiInteractions.map((log) => ({
                ...log,
                userId: "anonymized",
              })),
              notificationInteractions: logs.notificationInteractions.map((log) => ({
                ...log,
                userId: "anonymized",
              })),
              taskCompletions: logs.taskCompletions.map((log) => ({
                ...log,
                userId: "anonymized",
              })),
              usabilityMetrics: logs.usabilityMetrics.map((log) => ({
                ...log,
                userId: "anonymized",
                comments: "[REDACTED]",
              })),
            },
            null,
            2
          );
        }

        return JSON.stringify(logs, null, 2);
      } catch (error) {
        console.error("Error exporting logs as JSON:", error);
        return "{}";
      }
    },
    [exportLogs]
  );

  /**
   * Clear all interaction logs
   */
  const clearLogs = useCallback(async () => {
    try {
      Storage.remove(STORAGE_KEYS.INTERACTION_LOGS);
      Storage.remove("@ui_interactions");
      Storage.remove("@notification_interactions");
      Storage.remove("@task_completions");
      Storage.remove(STORAGE_KEYS.USABILITY_METRICS);

      console.log("All interaction logs cleared");
    } catch (error) {
      console.error("Error clearing logs:", error);
    }
  }, []);

  /**
   * Get summary statistics
   */
  const getLogSummary = useCallback(async () => {
    try {
      const logs = await exportLogs();

      // Calculate statistics
      const voiceSuccessRate =
        logs.voiceInteractions.length > 0
          ? (logs.voiceInteractions.filter((v) => v.success).length /
              logs.voiceInteractions.length) *
            100
          : 0;

      const avgVoiceExecutionTime =
        logs.voiceInteractions.length > 0
          ? logs.voiceInteractions.reduce((sum, v) => sum + v.executionTime, 0) /
            logs.voiceInteractions.length
          : 0;

      const avgTaskCompletionTime =
        logs.taskCompletions.length > 0
          ? logs.taskCompletions.reduce((sum, t) => sum + t.completionTime, 0) /
            logs.taskCompletions.length
          : 0;

      const taskSuccessRate =
        logs.taskCompletions.length > 0
          ? (logs.taskCompletions.filter((t) => t.success).length / logs.taskCompletions.length) *
            100
          : 0;

      const methodDistribution = {
        voice: logs.taskCompletions.filter((t) => t.method === "voice").length,
        ui: logs.taskCompletions.filter((t) => t.method === "ui").length,
        notification: logs.taskCompletions.filter((t) => t.method === "notification").length,
      };

      return {
        totalVoiceInteractions: logs.voiceInteractions.length,
        totalUIInteractions: logs.uiInteractions.length,
        totalNotificationInteractions: logs.notificationInteractions.length,
        totalTaskCompletions: logs.taskCompletions.length,
        voiceSuccessRate: Math.round(voiceSuccessRate),
        avgVoiceExecutionTime: Math.round(avgVoiceExecutionTime),
        avgTaskCompletionTime: Math.round(avgTaskCompletionTime),
        taskSuccessRate: Math.round(taskSuccessRate),
        methodDistribution,
        usabilitySessionsCount: logs.usabilityMetrics.length,
      };
    } catch (error) {
      console.error("Error getting log summary:", error);
      return null;
    }
  }, [exportLogs]);

  return {
    // Logging functions
    logVoiceInteraction,
    logUIInteraction,
    logNotificationInteraction,
    logTaskCompletion,
    logUsabilityMetrics,

    // Export functions
    exportLogs,
    exportLogsAsJSON,
    clearLogs,
    getLogSummary,

    // Utility
    isLoggingEnabled,
  };
};

export default useInteractionLogger;
