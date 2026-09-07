import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SHADOWS, SPACING, BORDERS } from '../theme';
import { api } from '../services/APIService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'steward' | 'system';
  timestamp: string;
}

/**
 * StewardChatScreen - AI 采购管家聊天界面
 * 对接后端 Ollama + Qwen3:4b 真实 AI 模型，支持 Function Calling
 */
export const StewardChatScreen = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya AI Steward AceProxy Anda. Ada yang bisa saya bantu terkait produk, harga, atau pesanan? 🛍️',
      sender: 'steward',
      timestamp: '10:00'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    const trimmed = inputText.trim();
    if (trimmed === '' || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add loading indicator
    const loadingMsg: Message = {
      id: 'loading',
      text: '...',
      sender: 'system',
      timestamp: ''
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for the AI
      const history = messages
        .filter(m => m.id !== '1' && m.sender !== 'system')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const response = await api.stewardChat(trimmed, history);

      // Remove loading, add real AI reply
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'loading');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          text: response.reply || 'Maaf, saya tidak bisa memproses itu saat ini.',
          sender: 'steward',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      });
    } catch (error: any) {
      console.error('[StewardChat] API error:', error);
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'loading');
        return [...filtered, {
          id: (Date.now() + 1).toString(),
          text: 'Maaf, otak AI saya sedang istirahat sebentar. Silakan coba lagi atau hubungi kami via WhatsApp! 💬',
          sender: 'steward',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.stewardInfo}>
          <View style={styles.avatarBox}>
            <Text style={{fontSize: 20}}>🤖</Text>
          </View>
          <View>
            <Text style={styles.stewardName}>AI Steward Bridge</Text>
            <Text style={styles.stewardStatus}>Online • Global Sourcing</Text>
          </View>
        </View>
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.sender === 'user' ? styles.userWrapper : styles.stewardWrapper
            ]}
          >
            {msg.sender === 'system' ? (
              <View style={[styles.messageBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#F97316" />
                <Text style={[styles.messageText, { color: '#94A3B8', marginLeft: 8 }]}>AI is thinking...</Text>
              </View>
            ) : (
              <>
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userBubble : styles.stewardBubble
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.userText : styles.stewardText
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
                <Text style={styles.timestamp}>{msg.timestamp}</Text>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Tanya Steward..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <View style={styles.sendIconBox}>
              <Text style={{color: '#FFF', fontWeight: 'bold'}}>↑</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    ...BORDERS.card,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#1E293B', fontWeight: '900' },
  stewardInfo: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...BORDERS.card,
  },
  stewardName: { fontSize: 15, fontWeight: '900', color: '#1E293B', textTransform: 'uppercase' },
  stewardStatus: { fontSize: 10, color: '#16A34A', fontWeight: '900' },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 32 },
  messageWrapper: { marginBottom: 20, maxWidth: '85%' },
  userWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  stewardWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { padding: 12, borderRadius: 12, minWidth: 80, ...BORDERS.card, ...SHADOWS.card },
  userBubble: { backgroundColor: '#F97316' },
  stewardBubble: { backgroundColor: '#FFF' },
  loadingBubble: { backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', borderStyle: 'dashed' },
  messageText: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  userText: { color: '#000' },
  stewardText: { color: '#1E293B' },
  timestamp: { fontSize: 9, color: '#000', marginTop: 8, fontWeight: '900' },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    ...BORDERS.card,
    borderTopWidth: 2.5,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    ...BORDERS.card,
    fontWeight: '700',
  },
  sendBtn: { marginLeft: 12 },
  sendIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    ...BORDERS.card,
    ...SHADOWS.card,
  }
});

