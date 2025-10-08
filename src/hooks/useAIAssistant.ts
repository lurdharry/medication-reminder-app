import { useState, useCallback, useRef, useEffect } from "react";
import { useVoice } from "./useVoice";
import aiVoiceAssistant from "../services/aiVoiceAssistant";
import medicationService from "../services/medicationService";
import { useMedicationContext } from "../contexts/MedicationContext";
import { useInteractionLogger } from "./useInteractionLogger";
import { ChatMessage, Intent, UserIntent } from "../types";
import { generateId } from "../utils/helpers";

export const useAIAssistant = () => {
  const { medications, addMedication, getUserPreferences, user } = useMedicationContext();
  const {
    isListening,
    transcript,
    error: voiceError,
    startListening: startVoiceRecognition,
    stopListening: stopVoiceRecognition,
    speak: speakText,
    clearTranscript,
  } = useVoice();

  const { logVoiceInteraction, logTaskCompletion } = useInteractionLogger();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const processingRef = useRef(false);

  /**
   * Update error state from voice hook
   */
  useEffect(() => {
    if (voiceError) {
      setError(voiceError);
    }
  }, [voiceError]);

  /**
   * Add a message to conversation
   */
  const addMessage = useCallback((type: "user" | "assistant", text: string, intent?: string) => {
    const message: ChatMessage = {
      id: generateId(),
      type,
      text,
      timestamp: new Date(),
      intent,
    };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  /**
   * Process the transcribed text
   */
  const processTranscript = useCallback(
    async (transcribedText: string) => {
      try {
        setIsProcessing(true);
        setError(null);

        // Add user message to chat
        addMessage("user", transcribedText);

        // Get user preferences and context
        const preferences = await getUserPreferences();

        // Process with AI
        const response = await aiVoiceAssistant.processUserInput(transcribedText, {
          medications,
          userPreferences: preferences,
          currentTime: new Date(),
          userName: user?.name,
          age: user?.age,
        });

        // Execute intent if needed
        if (response.shouldExecute) {
          await executeIntent(response.intent);
        }

        // Add assistant message to chat
        addMessage("assistant", response.text, response.intent.action);

        // Speak the response
        setIsSpeaking(true);
        await speakText(response.text);
        setIsSpeaking(false);

        // Log interaction for research
        const executionTime = Date.now() - startTimeRef.current;
        await logVoiceInteraction({
          userId: user?.id || "unknown",
          transcript: transcribedText,
          intent: response.intent.action,
          confidence: response.confidence,
          executionTime,
          success: true,
          context: {
            currentScreen: "AIAssistant",
            medicationsCount: medications.length,
            pendingDoses: medicationService.getPendingDoses().length,
          },
        });

        // Clear transcript
        clearTranscript();
        setIsProcessing(false);
        processingRef.current = false;
      } catch (err) {
        console.error("Error processing voice input:", err);
        setError("Could not process your request. Please try again.");
        setIsProcessing(false);
        setIsSpeaking(false);
        processingRef.current = false;

        // Log error
        await logVoiceInteraction({
          userId: user?.id || "unknown",
          transcript: transcribedText || "",
          intent: "ERROR",
          confidence: 0,
          executionTime: Date.now() - startTimeRef.current,
          success: false,
          errorMessage: err instanceof Error ? err.message : "Unknown error",
          context: {
            currentScreen: "AIAssistant",
            medicationsCount: medications.length,
            pendingDoses: medicationService.getPendingDoses().length,
          },
        });
      }
    },
    [
      medications,
      user,
      addMessage,
      getUserPreferences,
      logVoiceInteraction,
      speakText,
      clearTranscript,
    ]
  );

  /**
   * Start listening for voice input
   */
  const startListening = useCallback(async () => {
    try {
      setError(null);
      processingRef.current = false;
      startTimeRef.current = Date.now();
      await startVoiceRecognition();
    } catch (err) {
      console.error("Error starting voice recognition:", err);
      setError("Could not start listening. Please check microphone permissions.");
    }
  }, [startVoiceRecognition]);

  /**
   * Stop listening manually
   */
  const stopListening = useCallback(async () => {
    try {
      await stopVoiceRecognition();
    } catch (err) {
      console.error("Error stopping voice recognition:", err);
    }
  }, [stopVoiceRecognition]);

  /**
   * Execute intent based on AI response
   */
  const executeIntent = useCallback(
    async (intent: Intent) => {
      const taskStartTime = Date.now();
      let success = false;
      let errorCount = 0;

      try {
        switch (intent.action) {
          case UserIntent.ADD_MEDICATION:
            await handleAddMedication(intent);
            success = true;
            break;

          case UserIntent.MARK_TAKEN:
            await handleMarkTaken(intent);
            success = true;
            break;

          case UserIntent.SKIP_DOSE:
            await handleSkipDose(intent);
            success = true;
            break;

          case UserIntent.QUERY_SCHEDULE:
            // Handled by AI response text
            success = true;
            break;

          case UserIntent.QUERY_INTERACTIONS:
            await handleCheckInteractions(intent);
            success = true;
            break;

          case UserIntent.REQUEST_HELP:
            await handleRequestHelp(intent);
            success = true;
            break;

          default:
            console.log("No specific action for intent:", intent.action);
            success = true;
            break;
        }
      } catch (err) {
        console.error("Error executing intent:", err);
        errorCount++;
        success = false;
      }

      // Log task completion
      await logTaskCompletion({
        userId: user?.id || "unknown",
        task: intent.action,
        method: "voice",
        completionTime: Date.now() - taskStartTime,
        errorCount,
        success,
      });
    },
    [user, logTaskCompletion]
  );

  /**
   * Handle adding medication via voice
   */
  const handleAddMedication = useCallback(
    async (intent: Intent) => {
      const { medicationName, dosage, unit, times, purpose, instructions } = intent.entities;

      const newMedication = {
        id: generateId(),
        name: medicationName,
        dosage,
        unit,
        schedule: times?.map((time: string) => ({
          id: generateId(),
          time,
          taken: false,
          skipped: false,
        })),
        purpose: purpose || "",
        instructions: instructions || "",
        startDate: new Date(),
        refillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        adherenceRate: 0,
      };

      await addMedication(newMedication);
      console.log("Medication added via voice:", medicationName);
    },
    [addMedication]
  );

  /**
   * Handle marking medication as taken
   */
  const handleMarkTaken = useCallback(
    async (intent: Intent) => {
      const { medicationName } = intent.entities;

      const medication = medications.find(
        (m) => m.name.toLowerCase() === medicationName?.toLowerCase()
      );

      if (!medication) {
        console.error("Medication not found:", medicationName);
        return;
      }

      const pendingSchedule = medication.schedule.find((s) => !s.taken && !s.skipped);

      if (pendingSchedule) {
        await medicationService.markDoseTaken(medication.id, pendingSchedule.id);
        console.log("Marked as taken:", medication.name);
      }
    },
    [medications]
  );

  /**
   * Handle skipping a dose
   */
  const handleSkipDose = useCallback(
    async (intent: Intent) => {
      const { medicationName, reason } = intent.entities;

      const medication = medications.find(
        (m) => m.name.toLowerCase() === medicationName?.toLowerCase()
      );

      if (!medication) {
        console.error("Medication not found:", medicationName);
        return;
      }

      const pendingSchedule = medication.schedule.find((s) => !s.taken && !s.skipped);

      if (pendingSchedule) {
        await medicationService.markDoseSkipped(medication.id, pendingSchedule.id, reason);
        console.log("Marked as skipped:", medication.name);
      }
    },
    [medications]
  );

  /**
   * Handle checking drug interactions
   */
  const handleCheckInteractions = useCallback(
    async (intent: Intent) => {
      const { newMedication } = intent.entities;

      if (newMedication) {
        const result = await aiVoiceAssistant.checkDrugInteractions(medications, newMedication);
        console.log("Drug interaction check:", result);
      }
    },
    [medications]
  );

  /**
   * Handle help request
   */
  const handleRequestHelp = useCallback(async (intent: Intent) => {
    const { urgency, issue } = intent.entities;

    console.log(`Help requested - Urgency: ${urgency}, Issue: ${issue}`);

    if (urgency === "emergency") {
      console.log("EMERGENCY: Notifying emergency contacts");
      // TODO: Implement emergency contact notification
    }
  }, []);

  /**
   * Stop speaking (interrupt)
   */
  const stopSpeaking = useCallback(async () => {
    await aiVoiceAssistant.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  /**
   * Clear conversation history
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    aiVoiceAssistant.clearHistory();
    setError(null);
    clearTranscript();
  }, [clearTranscript]);

  /**
   * Send text message (non-voice input)
   */
  const sendTextMessage = useCallback(
    async (text: string) => {
      startTimeRef.current = Date.now();
      processingRef.current = true;
      await processTranscript(text);
    },
    [processTranscript]
  );

  return {
    // State
    messages,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    error: error || voiceError,

    // Actions
    startListening,
    stopListening,
    stopSpeaking,
    clearConversation,
    sendTextMessage,
    clearTranscript,
  };
};

export default useAIAssistant;
