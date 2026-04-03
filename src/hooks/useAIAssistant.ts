import { useState, useCallback, useRef, useEffect } from "react";
import * as Speech from "expo-speech";
import { useVoice } from "./useVoice";
import { aiApi } from "../services/api/aiApi";
import { doseRecordApi } from "../services/api/doseRecordApi";
import { useMedications } from "./useMedications";
import { useAuth } from "../contexts/AuthContext";
import { useInteractionLogger } from "./useInteractionLogger";
import { ChatMessage, Intent, UserIntent } from "../types";
import { generateId } from "../utils/helpers";

export const useAIAssistant = () => {
  const { medications, addMedication } = useMedications();
  const { user } = useAuth();
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

  useEffect(() => {
    if (voiceError) {
      setError(voiceError);
    }
  }, [voiceError]);

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

  const processTranscript = useCallback(
    async (transcribedText: string) => {
      try {
        setIsProcessing(true);
        setError(null);

        addMessage("user", transcribedText);

        const response = await aiApi.chat({ message: transcribedText });
        const aiData = response.data.data;

        const intent: Intent = {
          action: (aiData.intent as UserIntent) || UserIntent.GENERAL_QUESTION,
          entities: aiData.data || {},
          confidence: 0.9,
        };

        if (aiData.intent !== "GREETING" && aiData.intent !== "GENERAL_QUESTION" && aiData.intent !== "CASUAL_CHAT") {
          await executeIntent(intent);
        }

        addMessage("assistant", aiData.message, aiData.intent);

        setIsSpeaking(true);
        await speakText(aiData.message);
        setIsSpeaking(false);

        const executionTime = Date.now() - startTimeRef.current;
        await logVoiceInteraction({
          userId: user?.id || "unknown",
          transcript: transcribedText,
          intent: aiData.intent,
          confidence: 0.9,
          executionTime,
          success: true,
          context: {
            currentScreen: "AIAssistant",
            medicationsCount: medications.length,
            pendingDoses: 0,
          },
        });

        clearTranscript();
        setIsProcessing(false);
        processingRef.current = false;
      } catch (err) {
        console.error("Error processing voice input:", err);
        setError("Could not process your request. Please try again.");
        setIsProcessing(false);
        setIsSpeaking(false);
        processingRef.current = false;

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
            pendingDoses: 0,
          },
        });
      }
    },
    [medications, user, addMessage, logVoiceInteraction, speakText, clearTranscript]
  );

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

  const stopListening = useCallback(async () => {
    try {
      await stopVoiceRecognition();
    } catch (err) {
      console.error("Error stopping voice recognition:", err);
    }
  }, [stopVoiceRecognition]);

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

          default:
            success = true;
            break;
        }
      } catch (err) {
        console.error("Error executing intent:", err);
        errorCount++;
        success = false;
      }

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

  const handleAddMedication = useCallback(
    async (intent: Intent) => {
      const { medicationName, dosage, unit, times, purpose, instructions } = intent.entities;

      await addMedication({
        name: medicationName || "",
        dosage: dosage || "",
        unit: unit || "mg",
        purpose: purpose || "",
        instructions: instructions || "",
        startDate: new Date(),
        schedule: times?.map((time: string) => ({ time })),
      });
    },
    [addMedication]
  );

  const handleMarkTaken = useCallback(
    async (intent: Intent) => {
      const { medicationName } = intent.entities;

      const medication = medications.find(
        (m) => m.name.toLowerCase() === medicationName?.toLowerCase()
      );

      if (!medication) return;

      const pendingSchedule = medication.schedule.find((s) => !s.taken && !s.skipped);

      if (pendingSchedule) {
        await doseRecordApi.record(pendingSchedule.id, { status: "taken" });
      }
    },
    [medications]
  );

  const handleSkipDose = useCallback(
    async (intent: Intent) => {
      const { medicationName } = intent.entities;

      const medication = medications.find(
        (m) => m.name.toLowerCase() === medicationName?.toLowerCase()
      );

      if (!medication) return;

      const pendingSchedule = medication.schedule.find((s) => !s.taken && !s.skipped);

      if (pendingSchedule) {
        await doseRecordApi.record(pendingSchedule.id, { status: "skipped" });
      }
    },
    [medications]
  );

  const stopSpeaking = useCallback(async () => {
    await Speech.stop();
    setIsSpeaking(false);
  }, []);

  const clearConversation = useCallback(async () => {
    setMessages([]);
    await aiApi.clearConversation();
    setError(null);
    clearTranscript();
  }, [clearTranscript]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      startTimeRef.current = Date.now();
      processingRef.current = true;
      await processTranscript(text);
    },
    [processTranscript]
  );

  return {
    messages,
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    error: error || voiceError,

    startListening,
    stopListening,
    stopSpeaking,
    clearConversation,
    sendTextMessage,
    clearTranscript,
  };
};

export default useAIAssistant;
