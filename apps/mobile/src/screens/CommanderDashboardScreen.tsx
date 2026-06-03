import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, BORDERS, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

/**
 * CommanderDashboardScreen - Jakarta Commander Exclusive Console
 * Designed for community partners to track earnings, recruitment, and regional progress.
 */
export const CommanderDashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Elite Header */}
        <View style={styles.header}>
          <Text style={styles.headerTag}>COMMANDER CONSOLE</Text>
          <Text style={styles.title}>Welcome back, Commander</Text>
          
          <Animated.View 
            entering={FadeInDown.duration(800)}
            style={[styles.balanceCard, SHADOWS.brutalist]}
          >
            <Text style={styles.balanceLabel}>COMMANDER BALANCE (IDR)</Text>
            <Text style={styles.balanceAmount}>Rp 4,250,000</Text>
            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.miniLabel}>TOTAL EARNINGS</Text>
                <Text style={styles.miniVal}>Rp 12,800k</Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.miniLabel}>ACTIVE ORDERS</Text>
                <Text style={styles.miniVal}>24</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.withdrawBtn}>
              <Text style={styles.withdrawText}>WITHDRAW TO BANK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Real-time Ticker */}
        <View style={styles.tickerContainer}>
          <View style={styles.ticker}>
            <Text style={styles.tickerText}>● LIVE: Commander Al-Fatih just earned Rp 150k from JKT-North order</Text>
          </View>
        </View>

        {/* Recruitment Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY COMMUNITY REACH</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, SHADOWS.soft]}>
              <Text style={styles.statNum}>128</Text>
              <Text style={styles.statLabel}>Direct Referrals</Text>
            </View>
            <View style={[styles.statBox, SHADOWS.soft]}>
              <Text style={styles.statNum}>+14%</Text>
              <Text style={styles.statLabel}>Weekly Growth</Text>
            </View>
          </View>
        </View>

        {/* Regional Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>REGIONAL PULSE (拼单进度)</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={[styles.progressCard, SHADOWS.brutalist]}>
            <View style={styles.regionRow}>
              <Text style={styles.regionName}>JAKARTA NORTH (NORTHERN HUB)</Text>
              <Text style={styles.regionPct}>85% Full</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '85%' }]} />
            </View>
            <Text style={styles.progressSub}>Next Cargo Ship: LEBARAN PRIORITY (Flight 102)</Text>
            <TouchableOpacity style={styles.boostBtn}>
              <Text style={styles.boostText}>BOOST COMMUNITY SHARE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Commissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECENT COMMISSIONS</Text>
          {[1, 2, 3].map((item, idx) => (
            <Animated.View 
              key={idx}
              entering={FadeInUp.delay(idx * 150)}
              style={styles.orderRow}
            >
              <View style={styles.orderIcon}>
                <Text style={{fontSize: 20}}>📦</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.orderTitle}>Order #ACE-{2026000 + idx}</Text>
                <Text style={styles.orderTime}>2 hours ago • South Jakarta</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.orderCommission}>+Rp 45,000</Text>
                <Text style={styles.orderStatus}>AUDITED</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { padding: 24, backgroundColor: '#F8FAFC' },
  headerTag: { fontSize: 12, fontWeight: '900', color: COLORS.user.primary, letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '900', color: '#000', letterSpacing: -1, lineHeight: 32 },
  balanceCard: { backgroundColor: '#000', marginTop: 24, padding: 32, ...BORDERS.brutalist },
  balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  balanceAmount: { color: '#FFF', fontSize: 40, fontWeight: '900', marginVertical: 12 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  miniLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '900' },
  miniVal: { color: '#FFF', fontSize: 16, fontWeight: '900', marginTop: 4 },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  withdrawBtn: { backgroundColor: COLORS.user.primary, marginTop: 16, padding: 16, alignItems: 'center', ...BORDERS.brutalist },
  withdrawText: { color: '#000', fontWeight: '900', fontSize: 14 },
  tickerContainer: { height: 40, backgroundColor: '#FFF7ED', borderBottomWidth: 2, borderBottomColor: '#000', justifyContent: 'center' },
  ticker: { paddingHorizontal: 24 },
  tickerText: { fontSize: 11, fontWeight: '900', color: '#9A3412' },
  section: { padding: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#000', marginBottom: 16 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, ...BORDERS.brutalist },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444', marginRight: 6 },
  liveText: { fontSize: 10, fontWeight: '900', color: '#EF4444' },
  statsGrid: { flexDirection: 'row', gap: 16 },
  statBox: { flex: 1, backgroundColor: '#FFF', padding: 24, ...BORDERS.brutalist },
  statNum: { fontSize: 24, fontWeight: '900', color: '#000' },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '800', marginTop: 4 },
  progressCard: { backgroundColor: '#FFF', padding: 24, ...BORDERS.brutalist },
  regionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  regionName: { fontSize: 11, fontWeight: '900', color: '#64748B' },
  regionPct: { fontSize: 11, fontWeight: '900', color: COLORS.user.primary },
  progressBar: { height: 24, backgroundColor: '#F1F5F9', borderBottomWidth: 4, borderBottomColor: '#000', overflow: 'hidden', ...BORDERS.brutalist },
  progressFill: { height: '100%', backgroundColor: COLORS.user.primary },
  progressSub: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginTop: 12 },
  boostBtn: { borderTopWidth: 2, borderTopColor: '#000', marginTop: 16, paddingTop: 16, alignItems: 'center' },
  boostText: { fontSize: 13, fontWeight: '900', color: COLORS.user.primary },
  orderRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  orderIcon: { width: 44, height: 44, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', ...BORDERS.brutalist, marginRight: 16 },
  orderTitle: { fontSize: 14, fontWeight: '900', color: '#000' },
  orderTime: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '700' },
  orderCommission: { fontSize: 15, fontWeight: '900', color: '#059669' },
  orderStatus: { fontSize: 9, fontWeight: '900', color: '#64748B', marginTop: 4 }
});
