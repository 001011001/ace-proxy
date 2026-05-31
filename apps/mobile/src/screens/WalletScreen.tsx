import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

export const WalletScreen = () => {
  const { role, currentTheme: theme } = useRole();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>
          {role === 'USER' ? '钱包' : '收益中心'}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.balanceCard, { backgroundColor: theme.primary }, SHADOWS.medium]}>
          <Text style={styles.balanceLabel}>当前余额 (IDR)</Text>
          <Text style={styles.balanceAmount}>Rp 4,250,000</Text>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={[styles.withdrawText, { color: theme.primary }]}>立即提现</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statItem, SHADOWS.soft]}>
            <Text style={styles.statLabel}>今日预估</Text>
            <Text style={styles.statValue}>+Rp 150k</Text>
          </View>
          <View style={[styles.statItem, SHADOWS.soft]}>
            <Text style={styles.statLabel}>待结算</Text>
            <Text style={styles.statValue}>Rp 850k</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>最近账务</Text>
        {[1, 2, 3].map(i => (
          <View key={i} style={[styles.txItem, SHADOWS.soft]}>
            <View>
              <Text style={styles.txTitle}>
                {role === 'PARTNER' ? 'WhatsApp 分享奖励' : '订单返现'}
              </Text>
              <Text style={styles.txDate}>2026-05-30 14:20</Text>
            </View>
            <Text style={styles.txAmount}>+Rp 45,000</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { padding: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  title: { ...TYPOGRAPHY.h1, fontSize: 24, fontWeight: '900' },
  content: { padding: SPACING.md },
  balanceCard: { padding: 32, borderRadius: 28, alignItems: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  balanceAmount: { color: COLORS.white, fontSize: 36, fontWeight: '900', marginVertical: 12 },
  withdrawBtn: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 14 },
  withdrawText: { fontWeight: '800', fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginVertical: 20 },
  statItem: { flex: 1, backgroundColor: COLORS.white, padding: 16, borderRadius: 20, alignItems: 'center' },
  statLabel: { fontSize: 11, color: COLORS.gray[400], fontWeight: '700', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.gray[800] },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.gray[800], marginBottom: 16 },
  txItem: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  txTitle: { fontSize: 14, fontWeight: '700', color: COLORS.gray[800] },
  txDate: { fontSize: 11, color: COLORS.gray[400], marginTop: 4 },
  txAmount: { fontSize: 15, fontWeight: '800', color: '#16A34A' }
});
