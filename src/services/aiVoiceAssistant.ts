import * as Speech from "expo-speech";
import OpenAI from "openai";
import {
  ConversationMessage,
  Intent,
  AIResponse,
  Medication,
  UserPreferences,
  UserIntent,
} from "../types";
import { VOICE_SETTINGS } from "@/constants/voice";
import { MAIN_SYSTEM_PROMPT, generateContextPrompt } from "@/utils/prompt";
import { functionDefinations } from "@/constants/llm";

const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL;
const AI_TEMPERATURE = process.env.EXPO_PUBLIC_AI_TEMPERATURE;
const AI_MAX_TOKENS = process.env.EXPO_PUBLIC_AI_MAX_TOKENS;

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

/**
 * AI Voice Assistant Service
 *
 * This service handles ONLY the AI/NLP part of the voice assistant.
 * Speech recognition (STT) is handled by the useVoice hook.
 *
 * Flow:
 * 1. User speaks → useVoice hook (STT) → transcribed text
 * 2. Transcribed text → this service (LLM) → intent + response
 * 3. Response text → this service (TTS) → spoken output
 */
class AIVoiceAssistant {
  private conversationHistory: ConversationMessage[] = [];
  private function_definations: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [];

  constructor() {
    this.initializeSystemPrompt();
  }

  /**
   * Initialize the AI with system context
   */
  private initializeSystemPrompt(): void {
    const systemPrompt: ConversationMessage = {
      role: "system",
      content: MAIN_SYSTEM_PROMPT,
      timestamp: new Date(),
    };

    this.conversationHistory = [systemPrompt];
    this.function_definations = functionDefinations;
  }

  /**
   * Process user input (transcribed text from useVoice hook)
   * This is the main method called after voice recognition
   */
  async processUserInput(
    transcribedText: string,
    context: {
      medications: Medication[];
      userPreferences: UserPreferences;
      currentTime: Date;
      userName?: string;
      age?: number;
    }
  ): Promise<AIResponse> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: "user",
        content: transcribedText,
        timestamp: new Date(),
      });

      // Generate context-aware prompt
      const contextPrompt = generateContextPrompt({
        userName: context.userName,
        age: context.age,
        currentTime: context.currentTime,
        medications: context.medications,
      });

      // Call OpenAI API with function calling for intent extraction
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          ...this.conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "system", content: contextPrompt },
        ],
        temperature: AI_TEMPERATURE,
        max_completion_tokens: AI_MAX_TOKENS,
        functions: this.function_definations,
        function_call: "auto",
      });

      const aiMessage = completion.choices[0].message;

      // Extract intent from function call
      let intent: Intent = {
        action: UserIntent.GENERAL_QUESTION,
        entities: {},
        confidence: 0.8,
      };

      let shouldExecute = false;
      let responseText = aiMessage.content || "";

      if (aiMessage.function_call) {
        const functionArgs = JSON.parse(aiMessage.function_call.arguments);
        intent = {
          action: aiMessage.function_call.name as UserIntent,
          entities: functionArgs,
          confidence: 0.95,
        };
        shouldExecute = true; // Other intents can execute immediately
        responseText = this.generateResponseForIntent(intent, context);
      }

      const finalText = responseText || "I understand. How can I help you?";

      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: finalText,
        timestamp: new Date(),
      });

      return {
        text: aiMessage.content || "I understand. How can I help you?",
        intent,
        shouldExecute,
        confidence: intent.confidence,
      };
    } catch (error) {
      console.error("Error processing user input:", error);

      return {
        text: "I'm sorry, I'm having trouble understanding. Could you please repeat that?",
        intent: { action: UserIntent.ERROR, entities: {}, confidence: 0 },
        shouldExecute: false,
        confidence: 0,
      };
    }
  }

  /**
   * Generate appropriate response text based on intent
   */
  private generateResponseForIntent(intent: Intent, context: any): string {
    const userName = context.userName || "there";

    switch (intent.action) {
      case UserIntent.ADD_MEDICATION:
        return `Got it! I'm adding ${intent.entities.medicationName} ${intent.entities.dosage}${
          intent.entities.unit
        } to your schedule at ${intent.entities.times?.join(" and ")}.`;

      case UserIntent.MARK_TAKEN:
        return `Great job ${userName}! I've marked ${intent.entities.medicationName} as taken.`;

      case UserIntent.SKIP_DOSE:
        return `Okay, I've marked ${intent.entities.medicationName} as skipped.`;

      case UserIntent.QUERY_SCHEDULE:
        if (context.medications.length === 0) {
          return "You don't have any medications scheduled yet. Would you like to add one?";
        }
        const scheduleList = context.medications
          .map((med: any) => `${med.name} at ${med.schedule.map((s: any) => s.time).join(", ")}`)
          .join(". ");
        return `Here's your schedule: ${scheduleList}.`;

      case UserIntent.QUERY_INTERACTIONS:
        return `Let me check for interactions with ${intent.entities.newMedication}...`;

      case UserIntent.REQUEST_HELP:
        if (intent.entities.urgency === "emergency") {
          return `I'm calling for help right away! Stay calm, ${userName}.`;
        }
        return `I'm here to help, ${userName}. What do you need assistance with?`;

      case UserIntent.GET_ADHERENCE_REPORT:
        return `Let me get your adherence report for ${
          intent.entities.timeframe || "this week"
        }...`;

      default:
        return "I understand. How can I help you?";
    }
  }

  /**
   * Speak text using Text-to-Speech (Expo Speech)
   * This is called AFTER getting AI response
   */
  async speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      language?: string;
    }
  ): Promise<void> {
    try {
      // Stop any ongoing speech
      await this.stopSpeaking();

      Speech.speak(text, {
        language: options?.language || VOICE_SETTINGS.TTS_LANGUAGE,
        pitch: options?.pitch || VOICE_SETTINGS.TTS_PITCH,
        rate: options?.rate || VOICE_SETTINGS.TTS_RATE_ELDERLY,
      });
    } catch (error) {
      console.error("Error speaking:", error);
    }
  }

  /**
   * Stop current speech
   */
  async stopSpeaking(): Promise<void> {
    await Speech.stop();
  }

  /**
   * Clear conversation history (for privacy)
   */
  clearHistory(): void {
    this.conversationHistory = this.conversationHistory.slice(0, 1);
    console.log("Conversation history cleared");
  }

  /**
   * Check for drug interactions using AI
   */
  async checkDrugInteractions(
    medications: Medication[],
    newMedication?: string
  ): Promise<{
    hasInteractions: boolean;
    interactions: Array<{
      drug1: string;
      drug2: string;
      severity: "low" | "medium" | "high" | "critical";
      description: string;
      recommendation: string;
    }>;
  }> {
    try {
      const medicationNames = medications.map((m) => m.name);
      if (newMedication) {
        medicationNames.push(newMedication);
      }

      const prompt = `As a pharmacology expert, check for drug interactions between these medications:
${medicationNames.map((name, i) => `${i + 1}. ${name}`).join("\n")}

Respond with JSON only:
{
  "hasInteractions": boolean,
  "interactions": [
    {
      "drug1": "medication name",
      "drug2": "medication name",
      "severity": "low|medium|high|critical",
      "description": "simple explanation for elderly user",
      "recommendation": "what they should do"
    }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a pharmacology expert. Provide accurate drug interaction information in JSON format with simple language.",
          },
          { role: "user", content: prompt },
        ],
        temperature: AI_TEMPERATURE,
        max_completion_tokens: 600,
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      return result;
    } catch (error) {
      console.error("Error checking interactions:", error);
      return { hasInteractions: false, interactions: [] };
    }
  }

  /**
   * Get medication information from AI
   */
  async getMedicationInfo(medicationName: string): Promise<{
    name: string;
    purpose: string;
    commonSideEffects: string[];
    seriousSideEffects: string[];
    instructions: string[];
  } | null> {
    try {
      const prompt = `Provide easy-to-understand information about the medication: ${medicationName}

Respond with JSON only:
{
  "name": "${medicationName}",
  "purpose": "what it's used for (1-2 simple sentences)",
  "commonSideEffects": ["list 3-5 most common"],
  "seriousSideEffects": ["list serious ones to watch for"],
  "instructions": ["important usage instructions"]
}

Use simple language for elderly users. Avoid medical jargon.`;

      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "Provide accurate, easy-to-understand medication information in JSON format.",
          },
          { role: "user", content: prompt },
        ],
        temperature: AI_TEMPERATURE,
        max_completion_tokens: 600,
      });

      return JSON.parse(completion.choices[0].message.content || "null");
    } catch (error) {
      console.error("Error getting medication info:", error);
      return null;
    }
  }

  /**
   * Analyze adherence data and provide AI insights
   */
  async analyzeAdherence(adherenceData: {
    medications: Medication[];
    adherenceRate: number;
    takenOnTime: number;
    missedDoses: number;
  }): Promise<{
    insights: string[];
    suggestions: string[];
    encouragement: string;
  }> {
    try {
      const prompt = `Analyze this medication adherence data:
- Overall Rate: ${adherenceData.adherenceRate}%
- Doses Taken on Time: ${adherenceData.takenOnTime}
- Missed Doses: ${adherenceData.missedDoses}
- Medications: ${adherenceData.medications.map((m) => m.name).join(", ")}

Provide supportive analysis in JSON:
{
  "insights": ["3-5 specific observations about their patterns"],
  "suggestions": ["3-5 practical, actionable tips to improve"],
  "encouragement": "A warm, 2-3 sentence supportive message"
}

Be WARM, CONSTRUCTIVE, and PRACTICAL. Consider elderly users' needs.`;

      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a supportive health coach helping elderly users improve medication adherence.",
          },
          { role: "user", content: prompt },
        ],
        temperature: AI_TEMPERATURE,
        max_completion_tokens: 1000,
      });

      return JSON.parse(completion.choices[0].message.content || "{}");
    } catch (error) {
      console.error("Error analyzing adherence:", error);
      return {
        insights: ["You are doing well with your medication routine!"],
        suggestions: ["Try setting your phone alarm as a backup reminder"],
        encouragement:
          "You're making great progress! Every dose you take is important for your health.",
      };
    }
  }
}

export default new AIVoiceAssistant();
