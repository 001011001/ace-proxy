import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar,
  Image
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

/**
 * OnboardingScreen - 用户初次登入知悉页面
 * 目的：让用户在进入系统前明确“代购模式”与“不退货原则”
 */
export const OnboardingScreen = ({ onConfirm }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.imageContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFF7ED' }]}>
            <Text style={{ fontSize: 60 }}>📦</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.textContainer}>
          <Text style={styles.title}>Global Proxy Service</Text>
          <Text style={styles.subtitle}>AceProxy 跨境代购服务说明</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>✅</Text>
              <Text style={styles.infoText}>我们是您的全球买手，根据您的指令从 1688 原厂采购。</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🚫</Text>
              <Text style={styles.infoText}>由于跨境物流特殊性，下单后<Text style={styles.bold}>不支持无理由退货</Text>。</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>♻️</Text>
              <Text style={styles.infoText}>若收到货后不满意，您可以使用 <Text style={styles.brandText}>Resale Hub</Text> 快速转卖变现。</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(800)} style={styles.footer}>
          <TouchableOpacity 
            style={[styles.btn, SHADOWS.medium]} 
            onPress={onConfirm}
          >
            <Text style={styles.btnText}>我已了解代购模式</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  imageContainer: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  textContainer: { alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.gray[900] },
  subtitle: { fontSize: 16, color: COLORS.gray[500], marginTop: 8, fontWeight: '600' },
  infoCard: { 
    backgroundColor: '#FDFCFB', 
    padding: 24, 
    borderRadius: 24, 
    marginTop: 32, 
    width: '100%',
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  infoIcon: { fontSize: 18 },
  infoText: { fontSize: 14, color: COLORS.gray[700], lineHeight: 22, flex: 1, fontWeight: '500' },
  bold: { fontWeight: '800', color: '#DC2626' },
  brandText: { fontWeight: '800', color: '#F97316' },
  footer: { marginTop: 48 },
  btn: { backgroundColor: '#F97316', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: '900' }
});
