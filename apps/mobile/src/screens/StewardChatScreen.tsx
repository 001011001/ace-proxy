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
  SafeAreaView
} from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'steward';
  timestamp: string;
}

/**
 * StewardChatScreen - AI 采购管家聊天界面
 * 核心逻辑：用户与 AI Steward 对话，AI 后端对接 1688 卖家并处理翻译与议价。
 */
export const StewardChatScreen = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya Steward AceProxy Anda. Ada yang bisa saya bantu terkait pesanan atau pencarian barang di 1688?',
      sender: 'steward',
      timestamp: '10:00'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // 模拟 AI Steward 回复
    setTimeout(() => {
      const stewardMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Tentu, saya akan segera menanyakan hal ini ke supplier di 1688. Mohon tunggu sebentar ya.',
        sender: 'steward',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, stewardMsg]);
    }, 1500);
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#1E293B', fontWeight: '300' },
  stewardInfo: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  stewardName: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  stewardStatus: { fontSize: 10, color: '#16A34A', fontWeight: '700' },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 32 },
  messageWrapper: { marginBottom: 16, maxWidth: '80%' },
  userWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  stewardWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  messageBubble: { padding: 12, borderRadius: 20, minWidth: 60 },
  userBubble: { backgroundColor: '#1E293B', borderBottomRightRadius: 4 },
  stewardBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFF' },
  stewardText: { color: '#1E293B' },
  timestamp: { fontSize: 9, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9'
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100
  },
  sendBtn: { marginLeft: 12 },
  sendIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
