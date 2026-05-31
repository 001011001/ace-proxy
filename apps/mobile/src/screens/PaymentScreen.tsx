import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

/**
 * PaymentScreen - Xendit 支付收银台 (工业级重塑版)
 * 支持 Bank Transfer, E-Wallet (OVO, DANA, Gopay) 等本地支付方式。
 */
export const PaymentScreen = ({ orderTotal = '2,450,000' }) => {
  const { currentTheme: theme } = useRole();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.summary}>
          <Text style={styles.label}>应付金额 (IDR)</Text>
          <Text style={styles.amount}>Rp {orderTotal}</Text>
          <View style={styles.exchangeBadge}>
            <Text style={styles.exchangeNote}>≈ ¥ 1,108.60 RMB (含 5% FX Buffer)</Text>
          </View>
        </Animated.View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>选择本地支付方式 (Xendit Gateway)</Text>

          {/* Virtual Account */}
          <View style={[styles.methodGroup, SHADOWS.soft]}>
            <Text style={styles.groupLabel}>Bank Transfer (Virtual Account)</Text>
            <PaymentMethod name="Mandiri VA" />
            <PaymentMethod name="BCA VA" />
            <PaymentMethod name="BNI VA" last />
          </View>

          {/* E-Wallet */}
          <View style={[styles.methodGroup, SHADOWS.soft]}>
            <Text style={styles.groupLabel}>E-Wallet (Local Mobile Pay)</Text>
            <View style={styles.walletRow}>
              <WalletButton name="Gopay" />
              <WalletButton name="OVO" />
              <WalletButton name="DANA" />
            </View>
          </View>

          {/* OTC */}
          <View style={[styles.methodGroup, SHADOWS.soft]}>
            <Text style={styles.groupLabel}>Over-the-Counter</Text>
            <PaymentMethod name="Alfamart / Indomaret" last />
          </View>

          <TouchableOpacity 
            style={[styles.payButton, { backgroundColor: theme.primary }, SHADOWS.medium]}
          >
            <Text style={styles.payText}>确认并支付</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PaymentMethod = ({ name, last }: any) => (
  <TouchableOpacity style={[styles.method, last && { borderBottomWidth: 0 }]}>
    <View style={styles.methodCircle} />
    <Text style={styles.methodName}>{name}</Text>
  </TouchableOpacity>
);

const WalletButton = ({ name }: any) => (
  <TouchableOpacity style={styles.walletBtn}>
    <View style={styles.walletIconPlaceholder} />
    <Text style={styles.walletText}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  summary: { 
    padding: 40, 
    backgroundColor: COLORS.white, 
    alignItems: 'center', 
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...SHADOWS.soft
  },
  label: { fontSize: 13, color: COLORS.gray[400], fontWeight: '600', textTransform: 'uppercase' },
  amount: { ...TYPOGRAPHY.h1, fontSize: 36, color: COLORS.gray[900], marginVertical: 12 },
  exchangeBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  exchangeNote: { fontSize: 11, color: '#F97316', fontWeight: '700' },
  content: { padding: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.h2, fontSize: 16, color: COLORS.gray[800], marginVertical: 20 },
  methodGroup: { 
    backgroundColor: COLORS.white, 
    padding: SPACING.md, 
    borderRadius: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  groupLabel: { fontSize: 11, color: COLORS.gray[400], fontWeight: '700', marginBottom: 16, textTransform: 'uppercase' },
  method: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.gray[50] 
  },
  methodCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.gray[200], marginRight: 16 },
  methodName: { fontSize: 15, fontWeight: '600', color: COLORS.gray[800] },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  walletBtn: { 
    flex: 1, 
    paddingVertical: 16, 
    borderWidth: 1, 
    borderColor: COLORS.gray[100], 
    alignItems: 'center', 
    borderRadius: 16,
    backgroundColor: COLORS.gray[50]
  },
  walletIconPlaceholder: { width: 24, height: 24, backgroundColor: COLORS.gray[200], borderRadius: 6, marginBottom: 8 },
  walletText: { fontSize: 12, fontWeight: '700', color: COLORS.gray[600] },
  payButton: { marginTop: 20, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  payText: { color: COLORS.white, fontWeight: '900', fontSize: 18 }
});
