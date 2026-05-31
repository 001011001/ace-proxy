import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRole } from '../context/RoleContext';

const { width } = Dimensions.get('window');

/**
 * HomeScreen - AceProxy 移动端首页 (工业级重塑版)
 * 包含“利润脉搏”动画、大厂级身份切换、及多语言适配。
 */
export const HomeScreen = ({ stationData }: any) => {
  const { role, theme, switchRole } = useRole();
  const [pulseValue, setPulseValue] = useState(1);

  // 模拟利润脉搏动画 (Pulse Animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseValue(v => (v === 1 ? 1.05 : 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView stickyHeaderIndices={[0]}>
        {/* 1. 沉浸式 Header (带身份变色龙效果) */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.headerTop}>
            <Text style={styles.stationName}>{stationData.stationName}</Text>
            <TouchableOpacity style={styles.langBtn}>
              <Text style={styles.langText}>ID/ZH</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.status}>
            {role === 'SHOPPER' ? '正在探索全球利差...' : '站点运行中 - 安全等级: 高'}
          </Text>
        </View>

        {/* 2. 利润脉搏统计卡片 (Profit Pulse Card) */}
        <View style={[styles.pulseCard, { transform: [{ scale: pulseValue }] }]}>
          <Text style={styles.pulseTitle}>累计为您节省 / 获利 (IDR)</Text>
          <Text style={styles.pulseAmount}>Rp 12,450,000</Text>
          <View style={styles.pulseTrend}>
            <Text style={styles.trendText}>▲ 12% vs 上周</Text>
          </View>
        </View>

        {/* 3. 节日引擎 Banner */}
        <View style={[styles.holidayBanner, { backgroundColor: theme.colors.accent || '#ff4d4f' }]}>
          <Text style={styles.holidayTitle}>🌙 {stationData.announcement}</Text>
          <TouchableOpacity style={styles.holidayAction}>
            <Text style={styles.holidayActionText}>查看备货清单</Text>
          </TouchableOpacity>
        </View>

        {/* 4. 身份切换看板 (Identity Morphing) */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionLabel}>当前身份: {role}</Text>
          <View style={styles.roleGrid}>
            <RoleButton label="用户" active={role === 'SHOPPER'} onPress={() => switchRole('SHOPPER')} color="#F97316" />
            <RoleButton label="团长" active={role === 'PARTNER'} onPress={() => switchRole('PARTNER')} color="#1E3A8A" />
            <RoleButton label="骑手" active={role === 'RIDER'} onPress={() => switchRole('RIDER')} color="#10B981" />
          </View>
        </View>

        {/* 5. 爆款瀑布流占位 (ArbiWaterfall) */}
        <View style={styles.waterfall}>
          <Text style={styles.sectionTitle}>🔥 正在发生的套利机会</Text>
          <View style={styles.productRow}>
            <ProductCard name="穆斯林长裙" spread="186%" />
            <ProductCard name="极简加压袋" spread="215%" />
          </View>
        </View>
      </ScrollView>

      {/* 底部功能悬浮球 - ArbiBot */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.fabText}>AI 比价</Text>
      </TouchableOpacity>
    </View>
  );
};

const RoleButton = ({ label, active, onPress, color }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.roleBtn, { borderColor: color, backgroundColor: active ? color : 'transparent' }]}
  >
    <Text style={{ color: active ? '#fff' : color, fontWeight: 'bold' }}>{label}</Text>
  </TouchableOpacity>
);

const ProductCard = ({ name, spread }: any) => (
  <View style={styles.card}>
    <View style={styles.cardImg}><Text style={{color: '#ccc'}}>1688 Source</Text></View>
    <Text style={styles.cardName}>{name}</Text>
    <Text style={styles.cardSpread}>利差: {spread}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingBottom: 35 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stationName: { color: '#fff', fontSize: 22, fontWeight: '900' },
  langBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  langText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  status: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 },
  pulseCard: { 
    margin: 20, marginTop: -20, padding: 25, backgroundColor: '#fff', borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10
  },
  pulseTitle: { color: '#888', fontSize: 12, marginBottom: 5 },
  pulseAmount: { fontSize: 28, fontWeight: '900', color: '#000' },
  pulseTrend: { marginTop: 10, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#f6ffed', borderRadius: 4, alignSelf: 'flex-start' },
  trendText: { color: '#52c41a', fontSize: 10, fontWeight: 'bold' },
  holidayBanner: { marginHorizontal: 20, marginBottom: 20, padding: 20, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  holidayTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, flex: 1 },
  holidayAction: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  holidayActionText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  roleSection: { padding: 20 },
  sectionLabel: { color: '#888', fontSize: 12, marginBottom: 15 },
  roleGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  roleBtn: { width: width * 0.28, padding: 12, borderWidth: 1.5, borderRadius: 12, alignItems: 'center' },
  waterfall: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#eee' },
  cardImg: { height: 120, backgroundColor: '#f9f9f9', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cardName: { fontSize: 14, fontWeight: 'bold' },
  cardSpread: { fontSize: 12, color: '#f5222d', marginTop: 5, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOpacity: 0.3 }
  ,fabText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});
