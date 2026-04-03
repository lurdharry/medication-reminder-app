import { useState, useCallback, useRef, useEffect } from "react";
import * as Speech from "expo-speech";
import { useVoice } from "./useVoice";
import { aiApi } from "../services/api/aiApi";
import { doseRecordApi } from "../services/api/doseRecordApi";
import { useMedications } from "./useMedications";
import { useAuth } from "../contexts/AuthContext";
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTimeRef = useRef<number>(0);
  const processingRef = useRef(false);

  useEffect(() => {
    if (voiceError) setError(voiceError);
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

  const executeIntent = useCallback(
    async (intent: Intent) => {
      try {
        switch (intent.action) {
          case UserIntent.ADD_MEDICATION:
            await handleAddMedication(intent);
            break;
          case UserIntent.MARK_TAKEN:
            await handleMarkTaken(intent);
            break;
          case UserIntent.SKIP_DOSE:
            await handleSkipDose(intent);
            break;
        }
      } catch (err) {
        console.error("Error executing intent:", err);
      }
    },
    [handleAddMedication, handleMarkTaken, handleSkipDose]
  );

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

        if (
          aiData.intent !== "GREETING" &&
          aiData.intent !== "GENERAL_QUESTION" &&
          aiData.intent !== "CASUAL_CHAT"
        ) {
          await executeIntent(intent);
        }

        addMessage("assistant", aiData.message, aiData.intent);

        setIsSpeaking(true);
        await speakText(aiData.message);
        setIsSpeaking(false);

        clearTranscript();
        setIsProcessing(false);
        processingRef.current = false;
      } catch (err) {
        console.error("Error processing voice input:", err);
        setError("Could not process your request. Please try again.");
        setIsProcessing(false);
        setIsSpeaking(false);
        processingRef.current = false;
      }
    },
    [medications, user, addMessage, executeIntent, speakText, clearTranscript]
  );

  const startListening = useCallback(async () => {
    try {
      setError(null);
      processingRef.current = false;
      startTimeRef.current = Date.now();
      await startVoiceRecognition();
    } catch (err) {
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
