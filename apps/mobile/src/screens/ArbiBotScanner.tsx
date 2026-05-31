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
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

/**
 * ArbiBotScanner - AI 套利助手扫描/输入页面 (工业级重塑版)
 */
export const ArbiBotScanner = () => {
  const [url, setUrl] = useState('');
  const { currentTheme: theme, t } = useRole();

  const handleArbiSearch = () => {
    if (!url.includes('amazon') && !url.includes('shopee') && !url.includes('lazada') && !url.includes('tiktok')) {
      Alert.alert(t.arbiBot, '请输入有效的海外电商链接 (Amazon, Shopee, TikTok Shop 等)');
      return;
    }
    Alert.alert('AI 正在分析', `正在前往 1688 反查该商品并计算物流利差...`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(600)} style={styles.inner}>
            <Text style={[styles.title, { color: theme.primary }]}>{t.arbiBot}</Text>
            <Text style={styles.subtitle}>粘贴海外链接，AceProxy 自动为您匹配全球源头货源并计算价格优势</Text>
            
            <View style={[styles.inputContainer, SHADOWS.soft]}>
              <TextInput
                style={styles.input}
                placeholder="https://www.amazon.com/dp/..."
                placeholderTextColor={COLORS.gray[300]}
                value={url}
                onChangeText={setUrl}
                multiline
                selectionColor={theme.primary}
              />
            </View>

            <TouchableOpacity 
              style={[styles.scanButton, { backgroundColor: theme.primary }, SHADOWS.medium]} 
              onPress={handleArbiSearch}
            >
              <Text style={styles.buttonText}>开始 AI 价值分析</Text>
            </TouchableOpacity>

            <View style={styles.infoGrid}>
              <InfoCard 
                icon="🛡️" 
                label="专利比对" 
                desc="自动过滤 IP/Patent 风险" 
              />
              <InfoCard 
                icon="📦" 
                label="体积优化" 
                desc="真空包装利差计算" 
              />
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 专家建议</Text>
              <Text style={styles.tipText}>
                雅加达站点当前“穆斯林服饰”类目利差处于年度峰值，建议优先分析该品类。
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.footerText}>AceProxy ArbiBot v2.4 • Edge AI Enabled</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const InfoCard = ({ icon, label, desc }: any) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoDesc}>{desc}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { padding: SPACING.lg, paddingBottom: 100 },
  title: { ...TYPOGRAPHY.h1, fontSize: 32, fontWeight: '900', marginBottom: 8 },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.gray[500], fontSize: 15, lineHeight: 22, marginBottom: 32 },
  inputContainer: { 
    backgroundColor: COLORS.white, 
    borderRadius: 24, 
    padding: SPACING.md,
    minHeight: 160,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  input: { 
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 16,
    textAlignVertical: 'top'
  },
  scanButton: { 
    marginTop: 24, 
    height: 64, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonText: { color: COLORS.white, fontWeight: '900', fontSize: 18 },
  infoGrid: { flexDirection: 'row', gap: 12, marginTop: 40 },
  infoCard: { 
    flex: 1, 
    padding: SPACING.md, 
    backgroundColor: COLORS.white, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  infoIcon: { fontSize: 24, marginBottom: 8 },
  infoLabel: { fontWeight: '800', color: COLORS.gray[800], fontSize: 14 },
  infoDesc: { color: COLORS.gray[400], fontSize: 10, marginTop: 4, lineHeight: 14 },
  tipCard: { 
    marginTop: 24, 
    padding: SPACING.lg, 
    backgroundColor: '#FFFBEB', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#FEF3C7' 
  },
  tipTitle: { color: '#92400E', fontWeight: '800', fontSize: 14, marginBottom: 4 },
  tipText: { color: '#B45309', fontSize: 13, lineHeight: 18, opacity: 0.8 },
  footer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: COLORS.gray[300], fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 }
});
ing: 1.5 }
});
