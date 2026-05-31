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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

const MEDALS = [
  { id: '1', name: 'Bronze Sourcing', level: 'Lv.1', color: '#CD7F32', desc: '5% Service Fee Discount', active: true },
  { id: '2', name: 'Silver Sourcing', level: 'Lv.2', color: '#C0C0C0', desc: 'Free Shipping Voucher x1', active: true },
  { id: '3', name: 'Gold Sourcing', level: 'Lv.3', color: '#FFD700', desc: '10% Service Fee Discount', active: false },
  { id: '4', name: 'Platinum Global', level: 'Max', color: '#E5E4E2', desc: 'Priority Logistics Channel', active: false },
];

/**
 * MemberCenterScreen - AceProxy 会员与成就中心
 * 目的：通过等级与勋章系统提升用户粘性与忠诚度
 */
export const MemberCenterScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Member Center</Text>
          <View style={[styles.profileCard, SHADOWS.medium]}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar} />
              <View>
                <Text style={styles.userName}>Junaid Al-Fatih</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>Silver Member</Text>
                </View>
              </View>
            </View>
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Exp: 1,250 / 2,000</Text>
                <Text style={styles.nextLevel}>Next: Gold</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '62.5%' }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Sourcing Map</Text>
          <View style={[styles.mapCard, SHADOWS.soft]}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapText}>JKT ↔ CAN ↔ TYO</Text>
              <View style={styles.routeLine} />
              <View style={[styles.node, { left: '10%' }]} />
              <View style={[styles.node, { left: '50%' }]} />
              <View style={[styles.node, { left: '90%' }]} />
            </View>
            <View style={styles.mapStats}>
              <View style={styles.mapStatItem}>
                <Text style={styles.mapStatVal}>1.5k km</Text>
                <Text style={styles.mapStatLabel}>Sourced</Text>
              </View>
              <View style={styles.mapStatItem}>
                <Text style={styles.mapStatVal}>12</Text>
                <Text style={styles.mapStatLabel}>Active Routes</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Achievements</Text>
          <View style={styles.medalsGrid}>
            {MEDALS.map((medal, index) => (
              <Animated.View 
                key={medal.id}
                entering={FadeInDown.delay(index * 100).duration(600)}
                style={[styles.medalCard, !medal.active && styles.medalInactive]}
              >
                <View style={[styles.medalIcon, { backgroundColor: medal.color }]} />
                <Text style={styles.medalName}>{medal.name}</Text>
                <Text style={styles.medalLevel}>{medal.level}</Text>
                <Text style={styles.medalDesc}>{medal.desc}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Rewards</Text>
          <TouchableOpacity style={[styles.rewardRow, SHADOWS.soft]}>
            <View style={styles.rewardIcon}>
              <Text>🎟️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardTitle}>Service Fee 5% Off</Text>
              <Text style={styles.rewardExpiry}>Expires in 12 days</Text>
            </View>
            <Text style={styles.useText}>Use Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: SPACING.lg, backgroundColor: '#FFF', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 20 },
  profileCard: { backgroundColor: '#F97316', borderRadius: 24, padding: 24 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  userName: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  levelBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4, alignSelf: 'flex-start' },
  levelText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  progressSection: {},
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  nextLevel: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4 },
  progressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  section: { padding: SPACING.lg },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  medalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  medalCard: { 
    width: (width - SPACING.lg * 2 - 12) / 2, 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  medalInactive: { opacity: 0.5, backgroundColor: '#F1F5F9' },
  medalIcon: { width: 48, height: 48, borderRadius: 24, marginBottom: 12, elevation: 4 },
  medalName: { fontSize: 13, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  medalLevel: { fontSize: 10, color: '#64748B', marginTop: 2, fontWeight: '700' },
  medalDesc: { fontSize: 9, color: '#94A3B8', marginTop: 8, textAlign: 'center' },
  rewardRow: { backgroundColor: '#FFF', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  rewardIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  rewardTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  rewardExpiry: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  useText: { fontSize: 13, fontWeight: '800', color: '#F97316' }
});
