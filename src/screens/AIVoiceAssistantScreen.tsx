import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAIAssistant } from "@/hooks/useAIAssistant";

import { ChatMessage } from "@/types";
import { COLORS } from "@/constants/colors";
import { DIMENSIONS, FONTS } from "@/constants/theme";

export const AIVoiceAssistantScreen: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const {
    messages,
    isListening,
    isProcessing,
    isSpeaking,
    error,
    startListening,
    stopListening,
    stopSpeaking,
    clearConversation,
    sendTextMessage,
    transcript,
    clearTranscript,
  } = useAIAssistant();

  console.log({ transcript });

  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (transcript && !isListening) {
      setInputText(transcript);
      clearTranscript();
    }
  }, [transcript, isListening, clearTranscript]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messages.length > 0) {
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const handleSendMessage = async (message: string = inputText) => {
    if (!message.trim()) return;

    const textToSend = message.trim();

    setInputText("");
    inputRef.current?.clear();

    console.log({ message: textToSend });

    try {
      await sendTextMessage(textToSend);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleVoiceInput = async () => {
    stopSpeaking();
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const handleClearChat = () => {
    clearConversation();
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.type === "user";

    return (
      <View style={[styles.messageRow, isUser ? styles.userMessageRow : styles.aiMessageRow]}>
        {/* AI Avatar */}
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
          </View>
        )}

        {/* Message Bubble */}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>

          {/* Intent Badge */}
          {!isUser && item.intent && (
            <View style={styles.intentBadge}>
              <Text style={styles.intentText}>{item.intent}</Text>
            </View>
          )}

          <Text style={[styles.messageTime, isUser ? styles.userTime : styles.aiTime]}>
            {new Date(item.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isProcessing && !isSpeaking) return null;

    return (
      <View style={[styles.messageRow, styles.aiMessageRow]}>
        <View style={styles.aiAvatar}>
          <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.primary} />
        </View>
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.processingText}>{isSpeaking ? "Speaking..." : "Thinking..."}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="mic-outline" size={64} color={COLORS.gray.light} />
      <Text style={styles.emptyTitle}>AI Voice Assistant</Text>
      <Text style={styles.emptySubtitle}>
        Tap the microphone to speak or type your message below
      </Text>
      <View style={styles.examplesContainer}>
        {[
          "Try saying:",
          '• "Add my medication"',
          '• "I took my pills"',
          `• "What's my schedule?"`,
          '• "I need help"',
        ].map((item) => (
          <Text style={styles.examplesTitle} key={item}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Assistant</Text>
          {isListening && <Text style={styles.listeningIndicator}>🎤 Listening...</Text>}
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearChat}
          accessibilityLabel="Clear conversation"
        >
          <Ionicons name="trash-outline" size={24} color={COLORS.gray.dark} />
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesContent,
            messages.length === 0 && styles.emptyContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.gray.medium}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSendMessage()}
            editable={!isProcessing && !isListening}
          />

          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={handleVoiceInput}
            disabled={isProcessing}
            accessibilityLabel={isListening ? "Stop listening" : "Start voice input"}
          >
            <Ionicons
              name={isListening ? "stop-circle" : "mic"}
              size={28}
              color={isListening ? COLORS.error : COLORS.primary}
            />
          </TouchableOpacity>

          {isSpeaking && (
            <TouchableOpacity
              style={styles.stopSpeakingButton}
              onPress={stopSpeaking}
              accessibilityLabel="Stop speaking"
            >
              <Ionicons name="volume-mute" size={24} color={COLORS.error} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isProcessing) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !isProcessing ? COLORS.white : COLORS.gray.medium}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.lighter,
  },
  title: {
    fontSize: FONTS.size.extraLarge,
    fontWeight: "700",
    color: COLORS.gray.darkest,
  },
  listeningIndicator: {
    fontSize: FONTS.size.small,
    color: COLORS.error,
    marginTop: 4,
    fontWeight: "600",
  },
  clearButton: {
    padding: 8,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "15",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: FONTS.size.small,
    color: COLORS.error,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: DIMENSIONS.PADDING,
    flexGrow: 1,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: FONTS.size.huge,
    fontWeight: "700",
    color: COLORS.gray.darkest,
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
    marginTop: 8,
    textAlign: "center",
  },
  examplesContainer: {
    marginTop: 32,
    alignSelf: "stretch",
  },
  examplesTitle: {
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.gray.dark,
    marginBottom: 12,
  },
  exampleText: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
    marginBottom: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  aiMessageRow: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: FONTS.size.medium,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.white,
  },
  aiText: {
    color: COLORS.gray.darkest,
  },
  messageTime: {
    fontSize: FONTS.size.tiny,
    marginTop: 4,
  },
  userTime: {
    color: COLORS.white + "CC",
  },
  aiTime: {
    color: COLORS.gray.medium,
  },
  intentBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  intentText: {
    fontSize: FONTS.size.tiny,
    color: COLORS.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  processingText: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 4,
  },
  quickResponsesWrapper: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.lighter,
    paddingVertical: 12,
  },
  quickResponsesContent: {
    paddingHorizontal: DIMENSIONS.PADDING,
  },
  quickResponseButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray.light,
  },
  quickResponseText: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.darkest,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.lighter,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: FONTS.size.medium,
    color: COLORS.gray.darkest,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  voiceButtonActive: {
    backgroundColor: COLORS.error + "15",
  },
  stopSpeakingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.error + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray.light,
  },
});
