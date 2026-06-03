import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar 
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme';

/**
 * StewardBotScanner - AI 选品助手扫描/输入页面 (工业级重塑版)
 */
export const ArbiBotScanner = () => {
  const [url, setUrl] = useState('');
  const { currentTheme: theme, t } = useRole();

  const handleArbiSearch = () => {
    if (!url.includes('amazon') && !url.includes('shopee') && !url.includes('lazada') && !url.includes('tiktok')) {
      Alert.alert(t.arbiBot, '请输入有效的商品链接 (Amazon, Shopee, TikTok Shop 等)');
      return;
    }
    Alert.alert('AI 正在分析', `正在前往全球供应网络匹配该商品并计算最优采购路径...`);
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
            <Text style={styles.subtitle}>粘贴商品链接，AceProxy 自动为您匹配全球源头货源并确保品质优势</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  placeholderTextColor="#94A3B8"
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.searchBtn, { backgroundColor: theme.primary }]}
                onPress={handleArbiSearch}
                activeOpacity={0.8}
              >
                <Text style={styles.searchBtnText}>智能匹配货源</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickTips}>
              <Text style={styles.tipTitle}>💡 使用提示</Text>
              <Text style={styles.tipText}>
                StewardBot 会深度分析商品的工艺规格，绕过层层中间商，直接为您连接到最适配的制造工厂。
              </Text>
            </View>

            <View style={styles.features}>
              <FeatureItem icon="🛡️" label="Quality Check" desc="自动同步 VisionQC 质检标准" />
              <FeatureItem icon="🚢" label="Priority Route" desc="优先分配全球拼单货柜" />
              <FeatureItem icon="⚖️" label="Price Guard" desc="全自动实时价格审计" />
            </View>
          </Animated.View>
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.footerText}>AceProxy Industrial Sourcing v1.0</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, label, desc }: any) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureInfo}>
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: SPACING.lg },
  inner: { marginTop: 40 },
  title: { ...TYPOGRAPHY.h1, fontSize: 32, marginBottom: 12, textTransform: 'uppercase' },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.gray[500], marginBottom: 40, lineHeight: 22 },
  inputContainer: { marginBottom: 32 },
  inputWrapper: {
    backgroundColor: COLORS.white,
    ...BORDERS.brutalist,
    padding: 16,
    marginBottom: 20,
    boxShadow: '4px 4px 0px #000'
  },
  input: { fontSize: 16, fontWeight: '700', color: COLORS.gray[900] },
  searchBtn: {
    padding: 18,
    alignItems: 'center',
    ...BORDERS.brutalist,
    boxShadow: '6px 6px 0px #000'
  },
  searchBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 18, textTransform: 'uppercase' },
  quickTips: {
    padding: 20,
    backgroundColor: '#FFFBEB',
    ...BORDERS.brutalist,
    borderColor: '#FEF3C7',
    marginBottom: 40
  },
  tipTitle: { color: '#92400E', fontWeight: '900', fontSize: 14, marginBottom: 8 },
  tipText: { color: '#B45309', fontSize: 13, lineHeight: 20, fontWeight: '600' },
  features: { gap: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { fontSize: 24, marginRight: 16 },
  featureInfo: { flex: 1 },
  featureLabel: { fontWeight: '900', fontSize: 14, color: COLORS.gray[900], textTransform: 'uppercase' },
  featureDesc: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  footer: { padding: 20, alignItems: 'center' },
  footerText: { color: COLORS.gray[300], fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 }
});
