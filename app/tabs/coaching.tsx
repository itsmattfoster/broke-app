import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { mediumHaptic } from '../../lib/haptics';
import { generateFromConversation } from '../../lib/gemini';
import { TypingIndicator } from '../../components/ui/TypingIndicator';
import { useTypingEffect } from '../../hooks/useTypingEffect';
import { formatFinancialContext } from '../../lib/financial-context';

// Message interface (local state, not persisted)
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

// Component for AI messages with typing effect
const AIMessage: React.FC<{
  message: Message;
  isStreaming: boolean;
  onComplete: () => void;
  onTextUpdate?: () => void;
}> = ({ message, isStreaming, onComplete, onTextUpdate }) => {
  const { displayedText, isComplete } = useTypingEffect(
    isStreaming ? message.content : '',
    3 // Fast typing speed like ChatGPT
  );
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isStreaming && isComplete) {
      onComplete();
    }
  }, [isStreaming, isComplete, onComplete]);

  // Notify parent to scroll when text updates during typing
  useEffect(() => {
    if (isStreaming && !isComplete && displayedText.length > 0) {
      onTextUpdate?.();
    }
  }, [displayedText.length, isStreaming, isComplete, onTextUpdate]);

  // Blinking cursor animation
  useEffect(() => {
    if (isStreaming && !isComplete) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }
  }, [isStreaming, isComplete, cursorOpacity]);

  return (
    <View style={[styles.messageBubble, styles.aiBubble]}>
      <Text style={[styles.messageText, styles.aiText]}>
        {isStreaming && !isComplete ? displayedText : message.content}
        {isStreaming && !isComplete && (
          <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>▊</Animated.Text>
        )}
      </Text>
    </View>
  );
};

export default function CoachingScreen() {
  const { transactions, incomeSources, schoolPlan } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    mediumHaptic();

    // Add user message to local state
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    // Get API key from environment
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Gemini API key is not configured. Please check your environment variables.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
      return;
    }

    try {
      // Build conversation history from local messages state
      const conversationHistory = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: currentInput,
        },
      ];

      // Format financial context
      const financialContext = formatFinancialContext(transactions, incomeSources, schoolPlan);

      // System prompt for financial coaching
      const systemPrompt = `### ROLE:

You are Broke Bot, an AI assistant for personal finance management. You help users with budget optimization, spending analysis, savings strategies, subscription management, and general financial advice. You use a harsh, sometimes verbally insensitive tone.

### CONTEXT:

Below is a full overview of the user's financial data from the database. Use it to provide the user with more relevant, detailed answers to their questions. Only reference specific transactions, amounts, and dates when relevant or when the user asks for them. Don't overuse financial figures - let the conversation flow naturally and only bring up specific data when it adds value to your response.

${financialContext}

### TASK:

Keep responses to one paragraph maximum. Brevity is critical - you will be scored on how concise you are and how relevant the information you provide is. Don't provide information just to provide information. Get to the point quickly and avoid unnecessary words. If asked about recent spending, bring up spending information. If asked something unrelated to finances, try to steer the conversation toward something relevant.

Match the user's energy in your responses. If a user asks a short, simple question, give a concise answer. If a user provides a detailed, long prompt, still keep your response to one paragraph maximum - be comprehensive but brief.

When mentioning any monetary amounts (including amounts from the context data above), always include the dollar sign (e.g., "$150" not "150").

Be direct and honest - tell the user what they need to hear, not what they want to hear. Base your advice on the user's actual spending patterns and income when relevant.

You may use swearing for comedic effect or to emphasize a point when appropriate. Don't be afraid to use strong language to make your point - it fits your harsh, insensitive tone.

### RESTRICTIONS:

Write in plain text only - do not use markdown formatting (no **, __, *, or other markdown syntax). Never use emojis unless the user specifically asks for them. Never invent or assume financial details not provided in the context. Do not create "next steps" sections unless the user explicitly asks for action items. Keep responses natural and conversational, not structured like a formal document.`;

      const response = await generateFromConversation(
        conversationHistory,
        systemPrompt,
        apiKey
      );

      // Add AI message to local state
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      // Set streaming message ID to trigger typing effect
      setStreamingMessageId(aiMessage.id);
    } catch (error: any) {
      console.error('Error calling Gemini:', error);
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response from AI. Please try again.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive or typing indicator appears
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length, isLoading]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={21} // Move up less so it rests on top of keyboard
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        nestedScrollEnabled={true}
      >
        {messages.map((message) => {
          // Use typing effect for the streaming AI message
          if (message.role === 'assistant' && streamingMessageId === message.id) {
            return (
              <AIMessage
                key={message.id}
                message={message}
                isStreaming={true}
                onComplete={() => setStreamingMessageId(null)}
              />
            );
          }
          
          // Regular messages (user or completed AI messages)
          return (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.aiText,
              ]}>
                {message.content}
              </Text>
            </View>
          );
        })}
        {isLoading && !streamingMessageId && (
          <View
            style={[
              styles.messageBubble,
              styles.aiBubble,
            ]}
          >
            <TypingIndicator />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about your finances..."
          placeholderTextColor="#999999"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, (inputText.trim() === '' || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={inputText.trim() === '' || isLoading}
        >
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#000000',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#000000',
  },
  cursor: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 50, // Add extra bottom padding to lift input field up
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
});

