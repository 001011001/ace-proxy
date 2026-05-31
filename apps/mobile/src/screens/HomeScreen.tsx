import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  FadeInDown,
  Layout
} from 'react-native-reanimated';
import { useRole } from '../context/RoleContext';
import { SPACING, TYPOGRAPHY, SHADOWS, COLORS } from '../theme';
import { Skeleton } from '../components/Skeleton';
import { ArbiWaterfall } from '../components/ArbiWaterfall';

const { width } = Dimensions.get('window');

/**
 * HomeScreen - AceProxy 移动端首页 (工业级重塑版)
 * 包含“利润脉搏”动画、大厂级身份切换、及多语言适配。
 */
export const HomeScreen = ({ stationData }: any) => {
  const { role, setRole, currentTheme: theme, t } = useRole();
  const [loading, setLoading] = React.useState(true);

  // 1. 利润脉搏动画 (Reanimated Breathing)
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    // 模拟工业级骨架屏加载感
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.skeletonHeader}>
          <Skeleton width={200} height={32} borderRadius={8} />
          <Skeleton width={120} height={16} borderRadius={4} style={{ marginTop: 12 }} />
        </View>
        <View style={{ padding: SPACING.md }}>
          <Skeleton height={160} borderRadius={24} style={{ marginBottom: SPACING.lg }} />
          <Skeleton width="60%" height={24} borderRadius={4} style={{ marginBottom: SPACING.md }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton width="48%" height={120} borderRadius={16} />
            <Skeleton width="48%" height={120} borderRadius={16} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.gray[50] }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        stickyHeaderIndices={[0]} 
        showsVerticalScrollIndicator={false}
        layout={Layout.springify()}
      >
        {/* 1. 沉浸式 Header (带身份变色龙效果) */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={[styles.header, { backgroundColor: theme.primary }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.stationLabel}>{t.currentStation}</Text>
              <Text style={styles.stationName}>{stationData?.stationName || 'AceProxy Jakarta'}</Text>
            </View>
            <View style={styles.badgeContainer}>
              <View style={styles.fxBadge}>
                <Text style={styles.fxText}>ID/ZH</Text>
              </View>
            </View>
          </View>
          <Text style={styles.headerStatus}>
            {role === 'USER' ? '正在探索全球利差...' : '站点运行正常 • 安全审计已通过'}
          </Text>
        </Animated.View>

        <View style={styles.content}>
          {/* 2. 利润脉搏统计卡片 (Profit Pulse Card) */}
          <Animated.View style={[styles.pulseCard, pulseStyle, SHADOWS.medium]}>
            <Text style={styles.pulseTitle}>{t.totalProfit} (IDR)</Text>
            <Text style={styles.pulseAmount}>Rp 12,450,000</Text>
            <View style={styles.pulseTrend}>
              <Text style={styles.trendText}>▲ 12.4% vs last week</Text>
            </View>
          </Animated.View>

          {/* 3. 节日引擎 Banner (斋月特供) */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(800)}
            style={[styles.holidayBanner, SHADOWS.soft]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.holidayTitle}>{t.ramadanSpecial}</Text>
              <Text style={styles.holidayDesc}>{t.jakartaDesc}</Text>
            </View>
            <TouchableOpacity style={styles.holidayAction}>
              <Text style={styles.holidayActionText}>View</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* 4. AI 实时瀑布流 */}
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            <ArbiWaterfall />
          </Animated.View>

          {/* 5. 身份切换看板 (Identity Morphing) */}
          <View style={styles.roleSection}>
            <Text style={styles.sectionLabel}>{t.switchRole}</Text>
            <View style={styles.roleGrid}>
              <RoleButton 
                label={t.shopper} 
                active={role === 'USER'} 
                onPress={() => setRole('USER')} 
                color={COLORS.user.primary} 
              />
              <RoleButton 
                label={t.partner} 
                active={role === 'PARTNER'} 
                onPress={() => setRole('PARTNER')} 
                color={COLORS.partner.primary} 
              />
              <RoleButton 
                label={t.rider} 
                active={role === 'RIDER'} 
                onPress={() => setRole('RIDER')} 
                color={COLORS.rider.primary} 
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部悬浮功能球 (Haptic ARBI Button) */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }, SHADOWS.medium]}>
        <Text style={styles.fabText}>{t.arbiBot}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const RoleButton = ({ label, active, onPress, color }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[
      styles.roleBtn, 
      { borderColor: color, backgroundColor: active ? color : COLORS.white }
    ]}
  >
    <Text style={[
      styles.roleBtnText, 
      { color: active ? COLORS.white : color }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletonHeader: { padding: SPACING.lg, backgroundColor: COLORS.white },
  header: { 
    padding: SPACING.lg, 
    paddingBottom: SPACING.xxl + 10,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stationLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500', marginBottom: 4 },
  stationName: { ...TYPOGRAPHY.h2, color: COLORS.white, fontSize: 24, fontWeight: '800' },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  fxBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  fxText: { color: COLORS.white, fontSize: 10, fontWeight: '900' },
  headerStatus: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 12, fontWeight: '500' },
  content: { marginTop: -SPACING.xxl },
  pulseCard: { 
    marginHorizontal: SPACING.md, 
    padding: SPACING.lg, 
    backgroundColor: COLORS.white, 
    borderRadius: 28,
  },
  pulseTitle: { color: COLORS.gray[400], fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  pulseAmount: { ...TYPOGRAPHY.h1, color: COLORS.gray[900], fontSize: 30, fontWeight: '900' },
  pulseTrend: { 
    marginTop: 12, 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    backgroundColor: '#F0FDF4', 
    borderRadius: 8, 
    alignSelf: 'flex-start' 
  },
  trendText: { color: '#16A34A', fontSize: 10, fontWeight: '800' },
  holidayBanner: { 
    margin: SPACING.md, 
    padding: SPACING.lg, 
    backgroundColor: '#FFF1F2', 
    borderRadius: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  holidayTitle: { color: '#9F1239', fontWeight: '900', fontSize: 15, marginBottom: 2 },
  holidayDesc: { color: '#BE123C', fontSize: 11, fontWeight: '500', opacity: 0.8 },
  holidayAction: { backgroundColor: '#E11D48', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  holidayActionText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  roleSection: { padding: SPACING.md, paddingBottom: 120 },
  sectionLabel: { ...TYPOGRAPHY.caption, color: COLORS.gray[400], marginBottom: SPACING.md, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  roleGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  roleBtn: { width: width * 0.29, paddingVertical: 15, borderWidth: 2, borderRadius: 18, alignItems: 'center', ...SHADOWS.soft },
  roleBtnText: { fontWeight: '800', fontSize: 13 },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    paddingHorizontal: 24, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'row'
  },
  fabText: { color: COLORS.white, fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }
});
