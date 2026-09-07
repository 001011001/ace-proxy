import React, { useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  StatusBar,
  Alert,
  Image
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
import { SPACING, TYPOGRAPHY, SHADOWS, COLORS, BORDERS, ROUNDED, getActiveFestival } from '../theme';
import { Skeleton } from '../components/Skeleton';
import { ArbiWaterfall } from '../components/ArbiWaterfall';
import { FlashSaleBanner } from '../components/FlashSaleBanner';
import { HubProgressBar } from '../components/HubProgressBar';
import { EidViralPopup } from '../components/EidViralPopup';
import { TradeService, StationHome } from '../services/TradeService';
import { api } from '../services/APIService';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

/**
 * HomeScreen — AceProxy 移动端首页
 * DESIGN.md Track 1: warm terracotta on canvas-warm, pill-shaped interactive elements.
 */
export const HomeScreen = ({ stationData }: any) => {
  const navigation = useNavigation<any>();
  const { role, setRole, currentTheme: theme, t } = useRole();
  const [loading, setLoading] = React.useState(true);
  const [heroProducts, setHeroProducts] = React.useState<any[]>([]);
  const [hotProducts, setHotProducts] = React.useState<any[]>([]);
  const [localStationData, setLocalStationData] = React.useState<StationHome | null>(null);
  const [showEidPopup, setShowEidPopup] = React.useState(false);
  const [profitData, setProfitData] = React.useState<{ amount: string; trend: string } | null>(null);
  const festival = React.useMemo(() => getActiveFestival('ID'), []);

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

    const initData = async () => {
      try {
        const home = await TradeService.getStationHome();
        setLocalStationData(home);
        setHeroProducts(home.products || []);
      } catch (err) {
        console.error('[HomeScreen] Failed to load station data:', err);
      }
      try {
        // Also load real products for flash sale section
        const productsRes = await api.getProducts({ pageSize: 10, sortBy: 'popular' });
        const items = productsRes?.items || productsRes || [];
        setHotProducts(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('[HomeScreen] Failed to load hot products:', err);
      }
      try {
        const profit = await api.getProfitPulse();
        setProfitData(profit);
      } catch (err) {
        console.error('[HomeScreen] Failed to load profit data:', err);
        setProfitData(null);
      }
      setLoading(false);
    };
    
    if (festival.id === 'EID_PREMIUM') {
      setTimeout(() => setShowEidPopup(true), 1500);
    }

    initData();
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Category icons mapped to unicode symbols (no emoji)
  const categoryIcon = (category: string) => {
    const map: Record<string, string> = {
      Fashion: '◆', Travel: '◈', Electronics: '◇', Home: '□',
    };
    return map[category] || '○';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.consumer.background }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.skeletonHeader}>
          <Skeleton width={200} height={32} borderRadius={ROUNDED.md} />
          <Skeleton width={120} height={16} borderRadius={ROUNDED.xs} style={{ marginTop: SPACING.md }} />
        </View>
        <View style={{ padding: SPACING.md }}>
          <Skeleton height={160} borderRadius={ROUNDED.xl} style={{ marginBottom: SPACING.lg }} />
          <Skeleton width="60%" height={24} borderRadius={ROUNDED.xs} style={{ marginBottom: SPACING.md }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Skeleton width="48%" height={120} borderRadius={ROUNDED.lg} />
            <Skeleton width="48%" height={120} borderRadius={ROUNDED.lg} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: festival.background }]}>
      <StatusBar barStyle={festival.background === '#064E3B' ? 'light-content' : 'dark-content'} />
      <ScrollView 
        stickyHeaderIndices={[0]} 
        showsVerticalScrollIndicator={false}
        layout={Layout.springify()}
      >
        {/* Header (DESIGN.md: terracotta primary header) */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={[styles.header, { backgroundColor: festival.primary }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.stationLabel}>{festival.bannerText}</Text>
              <Text style={styles.stationName}>{localStationData?.stationName || 'AceProxy Jakarta'}</Text>
            </View>
            <View style={styles.badgeContainer}>
              <View style={styles.fxBadge}>
                <Text style={styles.fxText}>ID/ZH</Text>
              </View>
            </View>
          </View>
          <Text style={styles.headerStatus}>
            {role === 'USER' ? '正在为您智能选品...' : '站点运行正常 · 安全审计已通过'}
          </Text>
        </Animated.View>

        <View style={styles.content}>
          {/* Stock Alert (DESIGN.md: warning-soft card) */}
          {festival.showStockAlert && (
            <Animated.View 
              entering={FadeInDown.delay(200)}
              style={styles.stockAlert}
            >
              <Text style={styles.stockAlertText}>备货提醒: 距离节日仅剩 30 天，请提前锁货避免延误！</Text>
            </Animated.View>
          )}

          {/* Flash Sale Section (DESIGN.md: card-product style, pill tags) */}
          <View style={[styles.flashSection, { backgroundColor: festival.background === '#064E3B' ? '#065F46' : '#FFF7ED' }]}>
            <View style={styles.flashHeader}>
              <View>
                <Text style={[styles.flashTitle, { color: festival.primary }]}>
                  {festival.id === 'EID_PREMIUM' ? 'LEBARAN 2026: ELITE ACCESS' : 'Eid Mubarak 2026'}
                </Text>
                <Text style={[styles.flashSub, { color: festival.secondary }]}>Produk Terlaris Minggu Ini</Text>
              </View>
              <View style={[styles.countdownBox, { backgroundColor: festival.primary }]}>
                <Text style={styles.countdownText}>12:45:00</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hotScroll}>
              {(hotProducts.length > 0 ? hotProducts : heroProducts).slice(0, 8).map((item: any) => {
                const productId = item.id || item.productId;
                const productName = item.name || 'Produk';
                const priceIdr = item.priceIdr || item.localPriceIdr || 0;
                const costCny = item.costCny || item.sourcePriceCny || 0;
                const marginPct = item.arbitrageGapPct
                  ? Math.round(item.arbitrageGapPct * 100)
                  : (costCny > 0 && priceIdr > 0
                      ? Math.round(((priceIdr - costCny * 2200) / priceIdr) * 100)
                      : null);

                const imageUrl = (() => {
                  try {
                    const urls = item.imageUrls ? JSON.parse(item.imageUrls) : null;
                    return urls?.[0] || null;
                  } catch { return null; }
                })();

                return (
                <TouchableOpacity 
                  key={productId || Math.random()} 
                  style={styles.hotItemCard}
                  onPress={() => productId
                    ? navigation.navigate('ProductDetail', { productId })
                    : Alert.alert(productName, `Harga: Rp ${(priceIdr / 1000).toFixed(0)}k`)
                  }
                >
                  <View style={styles.hotImgBox}>
                    {imageUrl ? (
                      <Image 
                        source={{ uri: imageUrl }} 
                        style={{ width: 50, height: 50, borderRadius: ROUNDED.sm }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.hotImgIcon}>{categoryIcon(item.category)}</Text>
                    )}
                  </View>
                  <Text style={styles.hotItemName} numberOfLines={2}>{productName}</Text>
                  <Text style={styles.hotItemPrice}>Rp {(priceIdr / 1000).toFixed(0)}k</Text>
                  {marginPct !== null && marginPct > 0 && (
                    <View style={styles.gainTag}>
                      <Text style={styles.gainText}>-{marginPct}%</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
              })}
            </ScrollView>
          </View>

          {/* Minimalist Wave 2 (DESIGN.md: card-feature, pill action button) */}
          <View style={styles.minimalistSection}>
            <View style={styles.minHeader}>
              <Text style={styles.minTitle}>Modern Minimalism</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
                <Text style={styles.seeAll}>Lihat Semua →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.minGrid}>
              {hotProducts.slice(3, 6).map((item: any) => {
                const productId = item.id || item.productId;
                const productName = item.name || 'Produk';
                const priceIdr = item.priceIdr || item.localPriceIdr || 0;
                const costCny = item.costCny || item.sourcePriceCny || 0;

                return (
                <TouchableOpacity 
                  key={productId || Math.random()} 
                  style={styles.minCard}
                  onPress={() => productId
                    ? navigation.navigate('ProductDetail', { productId })
                    : Alert.alert('Elite Sourcing', `Navigating to ${productName}...`)
                  }
                >
                  <View style={styles.minCardHeader}>
                    <Text style={styles.minCardTitle} numberOfLines={2}>{productName}</Text>
                    <View style={styles.minIconBox}>
                      <Text style={styles.minIconText}>{categoryIcon(item.category)}</Text>
                    </View>
                  </View>
                  <View style={styles.minDetailsRow}>
                    <View style={styles.minDetailItem}>
                      <Text style={styles.minDetailLabel}>Cost (CNY)</Text>
                      <Text style={styles.minDetailValue}>¥{costCny}</Text>
                    </View>
                    <View style={styles.minDetailItem}>
                      <Text style={styles.minDetailLabel}>Price (IDR)</Text>
                      <Text style={styles.minDetailValue}>Rp {(priceIdr / 1000).toFixed(0)}k</Text>
                    </View>
                  </View>
                  <View style={styles.minActionBtn}>
                    <Text style={styles.minActionText}>Lihat Produk</Text>
                  </View>
                </TouchableOpacity>
              );
              })}
            </View>
          </View>

          {/* Logistics Pulse */}
          <HubProgressBar 
            hubName="JAKARTA UTARA"
            current={42.5}
            target={50}
            unit="kg"
          />

          {/* Profit Pulse Card (DESIGN.md: KPI card, pill border) */}
          <Animated.View style={[styles.pulseCard, pulseStyle]}>
            <Text style={styles.pulseTitle}>{t.totalProfit} (IDR)</Text>
            {profitData ? (
              <>
                <Text style={styles.pulseAmount}>{profitData.amount}</Text>
                <View style={styles.pulseTrend}>
                  <Text style={styles.trendText}>{profitData.trend}</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.pulseAmount}>Rp ---</Text>
                <View style={styles.pulseTrend}>
                  <Text style={styles.trendText}>Loading...</Text>
                </View>
              </>
            )}
          </Animated.View>

          {/* Flash Sale Banner */}
          <FlashSaleBanner 
            festival={festival} 
            onPress={() => Alert.alert('Elite Access', 'Accessing premium Lebaran 2026 catalog...')}
          />
        </View>
      </ScrollView>

      {/* Eid Viral Popup */}
      <EidViralPopup 
        visible={showEidPopup} 
        onClose={() => setShowEidPopup(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletonHeader: { padding: SPACING.lg },
  
  // Header
  header: { 
    padding: SPACING.lg, 
    paddingBottom: SPACING.xxl + 10,
    borderBottomLeftRadius: ROUNDED.xl,
    borderBottomRightRadius: ROUNDED.xl,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stationLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  stationName: { ...TYPOGRAPHY.headingXl, color: COLORS.white, fontSize: 24, fontWeight: '800' },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  fxBadge: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: ROUNDED.pill, 
  },
  fxText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  headerStatus: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 12, fontWeight: '500' },
  content: { marginTop: -SPACING.xxl },

  // Flash Section
  flashSection: { 
    marginHorizontal: SPACING.md, 
    marginBottom: SPACING.lg, 
    padding: SPACING.md, 
    borderRadius: ROUNDED.lg,
    ...BORDERS.hairline,
  },
  flashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  flashTitle: { fontSize: 18, fontWeight: '700', color: '#9A3412' },
  flashSub: { fontSize: 11, fontWeight: '600', color: '#C2410C', marginTop: 2 },
  countdownBox: { 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: ROUNDED.pill,
  },
  countdownText: { color: '#FFF', fontSize: 12, fontWeight: '700', fontFamily: 'Courier New' },
  hotScroll: { flexDirection: 'row' },
  hotItemCard: { 
    width: 110, 
    backgroundColor: '#FFF', 
    borderRadius: ROUNDED.md, 
    padding: 12, 
    marginRight: 12, 
    alignItems: 'center', 
    ...BORDERS.hairline,
  },
  hotImgBox: { 
    width: 50, 
    height: 50, 
    borderRadius: ROUNDED.sm, 
    backgroundColor: '#F8FAFC', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8, 
    ...BORDERS.hairline,
  },
  hotImgIcon: { fontSize: 20, color: COLORS.consumer.primary, fontWeight: '700' },
  hotItemName: { fontSize: 11, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
  hotItemPrice: { fontSize: 12, fontWeight: '700', color: '#F97316', marginTop: 4 },
  gainTag: { 
    backgroundColor: COLORS.consumer.primarySoft, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: ROUNDED.pill, 
    marginTop: 6,
  },
  gainText: { fontSize: 9, fontWeight: '700', color: COLORS.consumer.primary },

  // Minimalist Section
  minimalistSection: { marginHorizontal: SPACING.md, marginBottom: SPACING.xl },
  minHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  minTitle: { ...TYPOGRAPHY.headingSm, color: COLORS.consumer.text },
  seeAll: { fontSize: 12, fontWeight: '600', color: COLORS.consumer.textMute },
  minGrid: { gap: 16 },
  minCard: { 
    backgroundColor: '#FFF', 
    borderRadius: ROUNDED.lg, 
    padding: 20, 
    marginBottom: 16,
    ...BORDERS.hairline,
  },
  minCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  minCardTitle: { 
    ...TYPOGRAPHY.headingLg, 
    color: COLORS.consumer.text, 
    width: '70%', 
    textTransform: 'uppercase', 
    lineHeight: 28,
  },
  minIconBox: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  minIconText: { fontSize: 28, color: COLORS.consumer.primary, fontWeight: '700' },
  minDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  minDetailItem: { flex: 1 },
  minDetailLabel: { fontSize: 10, fontWeight: '700', color: COLORS.consumer.textMute, textTransform: 'uppercase', marginBottom: 4 },
  minDetailValue: { fontSize: 16, fontWeight: '700', color: COLORS.consumer.text },
  minActionBtn: { 
    backgroundColor: COLORS.consumer.primary, 
    paddingVertical: 14, 
    alignItems: 'center', 
    borderRadius: ROUNDED.pill,
  },
  minActionText: { color: COLORS.consumer.textOnPrimary, fontWeight: '700', fontSize: 14, textTransform: 'uppercase' },

  // Profit Pulse
  pulseCard: { 
    marginHorizontal: SPACING.md, 
    padding: SPACING.lg, 
    backgroundColor: COLORS.white, 
    borderRadius: ROUNDED.lg,
    ...BORDERS.hairline,
  },
  pulseTitle: { color: COLORS.gray[400], fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  pulseAmount: { ...TYPOGRAPHY.priceXxl, color: COLORS.consumer.text },
  pulseTrend: { 
    marginTop: 12, 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    backgroundColor: SEMANTIC.successSoft, 
    borderRadius: ROUNDED.pill, 
    alignSelf: 'flex-start',
  },
  trendText: { color: COLORS.success, fontSize: 10, fontWeight: '700' },

  // Stock Alert
  stockAlert: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: 12,
    backgroundColor: COLORS.consumer.primarySoft,
    borderRadius: ROUNDED.md,
    ...BORDERS.hairline,
  },
  stockAlertText: { color: COLORS.consumer.primary, fontSize: 12, fontWeight: '700', textAlign: 'center' },

  // Legacy
  roleSection: { padding: SPACING.md, paddingBottom: 120 },
  sectionLabel: { ...TYPOGRAPHY.caption, color: COLORS.gray[400], marginBottom: SPACING.md, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  roleGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  roleBtn: { width: width * 0.29, paddingVertical: 15, borderRadius: ROUNDED.pill, alignItems: 'center', ...BORDERS.hairline },
  roleBtnText: { fontWeight: '700', fontSize: 13 },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 20, 
    paddingHorizontal: 24, 
    height: 60, 
    borderRadius: ROUNDED.pill, 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'row',
  },
  fabText: { color: COLORS.white, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  shareCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: SEMANTIC.successSoft,
    borderRadius: ROUNDED.md,
    ...BORDERS.hairline,
  },
  shareTitle: { fontSize: 16, fontWeight: '700', color: SEMANTIC.success, marginBottom: 4 },
  shareDesc: { fontSize: 12, color: '#15803d', lineHeight: 18, marginBottom: 16 },
  waButton: { backgroundColor: SEMANTIC.success, paddingVertical: 12, borderRadius: ROUNDED.pill, alignItems: 'center' },
  waText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});

export default HomeScreen;
