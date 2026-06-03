import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  StatusBar,
  Alert
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
import { SPACING, TYPOGRAPHY, SHADOWS, COLORS, BORDERS, getActiveFestival } from '../theme';
import { Skeleton } from '../components/Skeleton';
import { ArbiWaterfall } from '../components/ArbiWaterfall';
import { FlashSaleBanner } from '../components/FlashSaleBanner';
import { HubProgressBar } from '../components/HubProgressBar';
import { EidViralPopup } from '../components/EidViralPopup';
import { TradeService } from '../services/TradeService';
import { HeroProduct } from '../../../server/src/modules/cms/CMSService';

const { width } = Dimensions.get('window');

/**
 * HomeScreen - AceProxy 移动端首页 (工业级重塑版)
 * 包含“全球选品脉搏”动画、大厂级身份切换、及多语言适配。
 */
export const HomeScreen = ({ stationData }: any) => {
  const { role, setRole, currentTheme: theme, t } = useRole();
  const [loading, setLoading] = React.useState(true);
  const [heroProducts, setHeroProducts] = React.useState<HeroProduct[]>([]);
  const [showEidPopup, setShowEidPopup] = React.useState(false);
  const festival = React.useMemo(() => getActiveFestival('ID'), []); // Assume ID for Jakarta pilot

  // 1. 全球选品脉搏动画 (Reanimated Breathing)
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

    // 加载 Hero 商品与模拟加载状态
    const initData = async () => {
      const products = await TradeService.getHeroProducts();
      setHeroProducts(products);
      setLoading(false);
      
      // Trigger Eid Viral Popup for Jakarta pilot after a short delay
      if (festival.id === 'EID_PREMIUM') {
        setTimeout(() => setShowEidPopup(true), 1500);
      }
    };
    
    initData();
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
    <SafeAreaView style={[styles.container, { backgroundColor: festival.background }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        stickyHeaderIndices={[0]} 
        showsVerticalScrollIndicator={false}
        layout={Layout.springify()}
      >
        {/* 1. 沉浸式 Header (带节日变色龙效果) */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={[styles.header, { backgroundColor: festival.primary }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.stationLabel}>{festival.bannerText}</Text>
              <Text style={styles.stationName}>{stationData?.stationName || 'AceProxy Jakarta'}</Text>
            </View>
            <View style={styles.badgeContainer}>
              <View style={styles.fxBadge}>
                <Text style={styles.fxText}>ID/ZH</Text>
              </View>
            </View>
          </View>
          <Text style={styles.headerStatus}>
            {role === 'USER' ? '正在为您智能选品...' : '站点运行正常 • 安全审计已通过'}
          </Text>
        </Animated.View>

        <View style={styles.content}>
          {/* 1.0 Stock-up Alert Banner (Dynamic) */}
          {festival.showStockAlert && (
            <Animated.View 
              entering={FadeInDown.delay(200)}
              style={styles.stockAlert}
            >
              <Text style={styles.stockAlertText}>⚠️ 备货提醒: 距离节日仅剩 30 天，请提前锁货避免延误！</Text>
            </Animated.View>
          )}

          {/* 1.1 Lebaran 2026 Countdown & Flash Sale */}
          <View style={[styles.eidFlashSection, SHADOWS.soft, { backgroundColor: festival.background === '#064E3B' ? '#065F46' : festival.background }]}>
            <View style={styles.eidHeader}>
              <View>
                <Text style={[styles.eidTitle, { color: festival.primary }]}>{festival.id === 'EID_PREMIUM' ? 'LEBARAN 2026: ELITE ACCESS' : 'Eid Mubarak 2026'}</Text>
                <Text style={[styles.eidSub, { color: festival.secondary }]}>🏆 Premium Sourcing Active</Text>
              </View>
              <View style={[styles.countdownBox, { backgroundColor: festival.primary }]}>
                <Text style={styles.countdownText}>12:45:00</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hotScroll}>
              {heroProducts.filter(p => p.id.startsWith('EP-2026')).map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.hotItemCard}
                  onPress={() => Alert.alert('Elite Sourcing', `Navigating to ${item.name}...`)}
                >
                  <View style={styles.hotImgBox}>
                    <Text style={{fontSize: 24}}>
                      {item.category === 'Apparel' ? '👗' : 
                       item.category === 'Religious' ? '🕋' : 
                       item.category === 'Electronics' ? '⌚' : '🎁'}
                    </Text>
                  </View>
                  <Text style={styles.hotItemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.hotItemPrice}>Rp {(item.targetPriceIDR / 1000).toFixed(0)}k</Text>
                  <View style={styles.gainTag}><Text style={styles.gainText}>+{item.marginPct}%</Text></View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 1.2 Minimalist Lebaran Wave (Wave 2) */}
          <View style={styles.minimalistSection}>
            <View style={styles.minHeader}>
              <Text style={styles.minTitle}>Modern Minimalism</Text>
              <TouchableOpacity onPress={() => Alert.alert('Wave 2', 'Loading exclusive Wave 2 curated list...')}>
                <Text style={styles.seeAll}>See Wave 2 →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.minGrid}>
              {heroProducts.filter(p => !p.id.startsWith('EP-2026')).slice(0, 3).map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.minCard}
                  onPress={() => Alert.alert('Elite Sourcing', `Navigating to ${item.name}...`)}
                >
                  <View style={styles.minCardHeader}>
                    <Text style={styles.minCardTitle} numberOfLines={2}>{item.name}</Text>
                    <View style={styles.minIconBox}>
                      <Text style={{fontSize: 32}}>
                        {item.category === 'Apparel' ? '👔' : '🏮'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.minDetailsRow}>
                    <View style={styles.minDetailItem}>
                      <Text style={styles.minDetailLabel}>Cost</Text>
                      <Text style={styles.minDetailValue}>￥{item.costCNY}</Text>
                    </View>
                    <View style={styles.minDetailItem}>
                      <Text style={styles.minDetailLabel}>Price (IDR)</Text>
                      <Text style={styles.minDetailValue}>Rp {(item.targetPriceIDR / 1000).toFixed(0)}k</Text>
                    </View>
                  </View>
                  <View style={styles.minActionBtn}>
                    <Text style={styles.minActionText}>Explore Quality</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 1.3 物流脉搏 (Jakarta Logistics Pulse) */}
          <HubProgressBar 
            hubName="JAKARTA UTARA"
            current={42.5}
            target={50}
            unit="kg"
          />

          {/* 2. 利润脉搏统计卡片 (Profit Pulse Card) */}
          <Animated.View style={[styles.pulseCard, pulseStyle, SHADOWS.medium]}>
            <Text style={styles.pulseTitle}>{t.totalProfit} (IDR)</Text>
            <Text style={styles.pulseAmount}>Rp 12,450,000</Text>
            <View style={styles.pulseTrend}>
              <Text style={styles.trendText}>▲ 12.4% vs last week</Text>
            </View>
          </Animated.View>

          {/* 3. 营销引擎 (Flash Sale Banner) */}
          <FlashSaleBanner 
            festival={festival} 
            onPress={() => Alert.alert('Elite Access', 'Accessing premium Lebaran 2026 catalog...')}
          />
        </View>
      </ScrollView>

      {/* 4. 开斋节大促裂变弹窗 */}
      <EidViralPopup 
        visible={showEidPopup} 
        onClose={() => setShowEidPopup(false)} 
      />
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
  eidFlashSection: { 
    marginHorizontal: SPACING.md, 
    marginBottom: SPACING.lg, 
    padding: SPACING.md, 
    backgroundColor: '#FFF7ED', 
    borderRadius: 12, 
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
  },
  eidHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  eidTitle: { fontSize: 18, fontWeight: '900', color: '#9A3412' },
  eidSub: { fontSize: 11, fontWeight: '700', color: '#C2410C', marginTop: 2 },
  countdownBox: { backgroundColor: '#F97316', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, ...BORDERS.brutalist },
  countdownText: { color: '#FFF', fontSize: 12, fontWeight: '900', fontFamily: 'Courier New' },
  hotScroll: { flexDirection: 'row' },
  hotItemCard: { width: 110, backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginRight: 12, alignItems: 'center', ...BORDERS.brutalist },
  hotImgBox: { width: 50, height: 50, borderRadius: 4, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 8, ...BORDERS.brutalist },
  hotItemName: { fontSize: 11, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  hotItemPrice: { fontSize: 12, fontWeight: '900', color: '#F97316', marginTop: 4 },
  gainTag: { backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 6, ...BORDERS.brutalist },
  gainText: { fontSize: 9, fontWeight: '900', color: '#16A34A' },
  minimalistSection: { marginHorizontal: SPACING.md, marginBottom: SPACING.xl },
  minHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  minTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', letterSpacing: -0.5 },
  seeAll: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  minCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 4, 
    padding: 20, 
    marginBottom: 20,
    ...BORDERS.brutalist, 
    ...SHADOWS.brutalist 
  },
  minCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  minCardTitle: { fontSize: 24, fontWeight: '900', color: '#000', width: '70%', textTransform: 'uppercase', lineHeight: 28 },
  minIconBox: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  minDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  minDetailItem: { flex: 1 },
  minDetailLabel: { fontSize: 10, fontWeight: '900', color: '#000', textTransform: 'uppercase', marginBottom: 4 },
  minDetailValue: { fontSize: 16, fontWeight: '900', color: '#000' },
  minActionBtn: { 
    backgroundColor: '#F97316', 
    paddingVertical: 14, 
    alignItems: 'center', 
    borderRadius: 4,
    ...BORDERS.brutalist,
  },
  minActionText: { color: '#000', fontWeight: '900', fontSize: 16, textTransform: 'uppercase' },
  minImgPlaceholder: { width: 80, height: 80, borderRadius: 0, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', ...BORDERS.brutalist },
  patentBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, ...BORDERS.brutalist },
  patentText: { fontSize: 8, fontWeight: '900', color: '#64748B' },
  pulseCard: { 
    marginHorizontal: SPACING.md, 
    padding: SPACING.lg, 
    backgroundColor: COLORS.white, 
    borderRadius: 16,
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
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
  stockAlert: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
  },
  stockAlertText: { color: '#FFF', fontSize: 12, fontWeight: '900', textAlign: 'center' },
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
  roleBtn: { width: width * 0.29, paddingVertical: 15, borderRadius: 12, alignItems: 'center', ...BORDERS.brutalist, ...SHADOWS.brutalist },
  roleBtnText: { fontWeight: '800', fontSize: 13 },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    paddingHorizontal: 24, 
    height: 60, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'row',
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
  },
  fabText: { color: COLORS.white, fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  shareCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
  },
  shareTitle: { fontSize: 16, fontWeight: '900', color: '#166534', marginBottom: 4 },
  shareDesc: { fontSize: 12, color: '#15803d', lineHeight: 18, marginBottom: 16 },
  waButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  waText: { color: COLORS.white, fontWeight: '800', fontSize: 14 }
});
