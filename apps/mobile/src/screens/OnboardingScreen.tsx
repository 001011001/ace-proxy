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
          <Text style={styles.title}>Selamat Datang!</Text>
          <Text style={styles.subtitle}>Welcome to AceProxy</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoPara}>
              Kami adalah asisten jasa titip internasional Anda. Semua produk dibeli langsung dari pabrik global pilihan sesuai instruksi Anda.
            </Text>
            <View style={styles.divider} />
            <Text style={[styles.infoPara, { color: '#9A3412' }]}>
              <Text style={styles.bold}>Catatan Jastip (Proxy Note):</Text> Karena barang dipesan khusus untuk Anda, kami <Text style={styles.boldText}>tidak dapat menerima retur</Text>.
            </Text>
            <View style={styles.divider} />
            <Text style={styles.infoPara}>
              Namun, jika barang tidak sesuai, Anda bisa langsung menjualnya di <Text style={styles.brandText}>Resale Hub</Text> kami untuk profit tambahan!
            </Text>
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
    backgroundColor: '#FFF7ED', 
    padding: 24, 
    borderRadius: 28, 
    marginTop: 32, 
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFEDD5'
  },
  infoPara: { fontSize: 14, color: COLORS.gray[700], lineHeight: 22, textAlign: 'center', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#FFEDD5', marginVertical: 16 },
  bold: { fontWeight: '800' },
  boldText: { fontWeight: '900', color: '#DC2626' },
  brandText: { fontWeight: '800', color: '#F97316' },
  footer: { marginTop: 48 },
  btn: { backgroundColor: '#F97316', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: '900' }
});
