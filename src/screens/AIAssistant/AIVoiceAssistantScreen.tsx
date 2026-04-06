import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

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
    try {
      await sendTextMessage(textToSend);
    } catch (err) {
      console.error("Error sending message:", err);
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

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.type === "user";

    return (
      <View style={[styles.messageRow, isUser ? styles.userMessageRow : styles.aiMessageRow]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.primary} />
          </View>
        )}

        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>

          {!isUser && item.intent && (
            <View style={styles.intentBadge}>
              <Text style={styles.intentText}>{item.intent}</Text>
            </View>
          )}

          <Text style={[styles.messageTime, isUser ? styles.userTime : styles.aiTime]}>
            {format(new Date(item.timestamp), "h:mm a")}
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
          <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.primary} />
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
      <View style={styles.emptyIconBg}>
        <Ionicons name="mic-outline" size={40} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>AI Assistant</Text>
      <Text style={styles.emptySubtitle}>
        Tap the microphone to speak{"\n"}or type your message below
      </Text>
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesLabel}>Try saying:</Text>
        {[
          '"Add my medication"',
          '"I took my pills"',
          '"What\'s my schedule?"',
          '"I need help"',
        ].map((item) => (
          <Pressable
            key={item}
            style={styles.exampleChip}
            onPress={() => handleSendMessage(item.replace(/"/g, ""))}
          >
            <Text style={styles.exampleText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Assistant</Text>
          {isListening && <Text style={styles.listeningText}>Listening...</Text>}
        </View>
        <Pressable style={styles.clearButton} onPress={clearConversation}>
          <Ionicons name="trash-outline" size={20} color={COLORS.gray.medium} />
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
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

        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.gray.light}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSendMessage()}
            editable={!isProcessing && !isListening}
          />

          <Pressable
            style={[styles.iconBtn, isListening && styles.iconBtnActive]}
            onPress={handleVoiceInput}
            disabled={isProcessing}
          >
            <Ionicons
              name={isListening ? "stop-circle" : "mic"}
              size={22}
              color={isListening ? COLORS.error : COLORS.primary}
            />
          </Pressable>

          {isSpeaking && (
            <Pressable style={[styles.iconBtn, styles.iconBtnDanger]} onPress={stopSpeaking}>
              <Ionicons name="volume-mute" size={20} color={COLORS.error} />
            </Pressable>
          )}

          <Pressable
            style={[styles.sendBtn, (!inputText.trim() || isProcessing) && styles.sendBtnDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() && !isProcessing ? COLORS.white : COLORS.gray.medium}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray.lighter,
  },
  title: { fontSize: 26, fontWeight: "700", color: COLORS.primaryDark },
  listeningText: {
    fontSize: FONTS.size.small,
    color: COLORS.accent,
    marginTop: 2,
    fontWeight: "600",
  },
  clearButton: { padding: 8 },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "10",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 10,
    gap: 8,
  },
  errorText: { flex: 1, fontSize: FONTS.size.small, color: COLORS.error },

  keyboardView: { flex: 1 },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: DIMENSIONS.PADDING,
    flexGrow: 1,
  },
  emptyContainer: { justifyContent: "center", alignItems: "center" },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.tint.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: FONTS.size.huge,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: FONTS.size.medium,
    color: COLORS.gray.medium,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  examplesContainer: { marginTop: 28, alignSelf: "stretch" },
  examplesLabel: {
    fontSize: FONTS.size.small,
    fontWeight: "600",
    color: COLORS.gray.dark,
    marginBottom: 10,
  },
  exampleChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
    marginBottom: 8,
  },
  exampleText: { fontSize: FONTS.size.small, color: COLORS.gray.dark },

  // Messages
  messageRow: { flexDirection: "row", marginBottom: 14, alignItems: "flex-end" },
  userMessageRow: { justifyContent: "flex-end" },
  aiMessageRow: { justifyContent: "flex-start" },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.tint.blue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.gray.lightest,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: FONTS.size.medium, lineHeight: 21 },
  userText: { color: COLORS.white },
  aiText: { color: COLORS.primaryDark },
  messageTime: { fontSize: FONTS.size.tiny, marginTop: 4 },
  userTime: { color: COLORS.white + "AA" },
  aiTime: { color: COLORS.gray.medium },
  intentBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.tint.purple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  intentText: {
    fontSize: 9,
    color: COLORS.primaryDark,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  processingText: {
    fontSize: FONTS.size.small,
    color: COLORS.gray.medium,
    marginTop: 4,
  },

  // Input bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: DIMENSIONS.PADDING,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray.lighter,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.gray.lightest,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: FONTS.size.medium,
    color: COLORS.primaryDark,
    borderWidth: 1,
    borderColor: COLORS.gray.lighter,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.tint.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnActive: { backgroundColor: COLORS.error + "12" },
  iconBtnDanger: { backgroundColor: COLORS.error + "12" },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: COLORS.gray.lighter },
});
