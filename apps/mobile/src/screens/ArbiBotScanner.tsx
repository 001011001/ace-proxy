import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

/**
 * ArbiBotScanner - AI 套利助手扫描/输入页面 (Pro Version)
 */
export const ArbiBotScanner = () => {
  const [url, setUrl] = useState('');
  const { theme } = useRole();

  const handleArbiSearch = () => {
    if (!url.includes('amazon') && !url.includes('shopee') && !url.includes('lazada')) {
      Alert.alert('提示', '请输入有效的 Amazon, Shopee 或 Lazada 链接');
      return;
    }
    Alert.alert('AI 正在分析', `正在前往 1688 反查该商品并计算物流利差...`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.inner}>
          <Text style={[styles.title, { color: theme.primary }]}>ArbiBot AI</Text>
          <Text style={styles.subtitle}>粘贴海外链接，AceProxy 自动为您匹配 1688 原厂货源并计算全球利差</Text>
          
          <View style={[styles.inputContainer, SHADOWS.soft]}>
            <TextInput
              style={styles.input}
              placeholder="https://www.amazon.com/dp/..."
              placeholderTextColor={COLORS.gray[400]}
              value={url}
              onChangeText={setUrl}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.scanButton, { backgroundColor: theme.primary }, SHADOWS.medium]} 
            onPress={handleArbiSearch}
          >
            <Text style={styles.buttonText}>开始 AI 套利分析</Text>
          </TouchableOpacity>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🛡️</Text>
              <Text style={styles.infoLabel}>专利比对</Text>
              <Text style={styles.infoDesc}>自动过滤知识产权风险</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📦</Text>
              <Text style={styles.infoLabel}>容积率优化</Text>
              <Text style={styles.infoDesc}>计算真空包装后的物流增益</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>AceProxy ArbiBot v2.4 - Edge AI Enabled</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  keyboardView: { flex: 1 },
  inner: { padding: SPACING.lg, flex: 1 },
  title: { ...TYPOGRAPHY.h1, marginBottom: 8 },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.gray[500], marginBottom: 32 },
  inputContainer: { 
    backgroundColor: COLORS.white, 
    borderRadius: 16, 
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  input: { 
    height: 120, 
    ...TYPOGRAPHY.body,
    textAlignVertical: 'top'
  },
  scanButton: { 
    marginTop: 24, 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 18 },
  infoGrid: { flexDirection: 'row', gap: 12, marginTop: 40 },
  infoCard: { 
    flex: 1, 
    padding: SPACING.md, 
    backgroundColor: COLORS.white, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  infoIcon: { fontSize: 24, marginBottom: 8 },
  infoLabel: { fontWeight: 'bold', color: COLORS.gray[800], fontSize: 14 },
  infoDesc: { color: COLORS.gray[500], fontSize: 11, marginTop: 4 },
  footer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: COLORS.gray[300], fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }
});
