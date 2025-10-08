import { useState, useEffect, useCallback, useRef } from "react";
import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";
import * as Speech from "expo-speech";

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
      isListeningRef.current = false;
      // Clear timeout if voice ends naturally
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value[0]) {
        setTranscript(e.value[0]);
      }
    };

    Voice.onSpeechError = (e: any) => {
      setIsListening(false);
      isListeningRef.current = false;
      setError(e.error?.message || "Speech recognition error");
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const stopListening = useCallback(async () => {
    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      await Voice.stop();
      setIsListening(false);
      isListeningRef.current = false;
    } catch (err) {
      console.error("Stop listening error:", err);
      setError(err?.toString() || "Failed to stop");
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      // Clear any previous state
      setError(null);
      setTranscript("");

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      await Voice.start("en-us");
      setIsListening(true);
      isListeningRef.current = true;
    } catch (err) {
      setError(err?.toString() || "Failed to start");
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [stopListening]);

  const speak = useCallback(
    async (text: string, options?: any) => {
      try {
        if (isListeningRef.current) {
          await stopListening();
          // Small delay to ensure mic is off
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        await Speech.stop(); // Stop any ongoing speech
        Speech.speak(text);
      } catch (err) {
        console.error("TTS error:", err);
      }
    },
    [stopListening]
  );

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    clearTranscript,
  };
};
