import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  StatusBar,
  Image,
  TouchableOpacity
} from 'react-native';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

const MOCK_RESALE_ITEMS = [
  { id: '1', item: 'Nike Air Max (Size 42)', price: 'Rp 850,000', originalPrice: 'Rp 1,200,000', seller: 'User_4421', condition: 'Brand New', time: '2h ago' },
  { id: '2', item: 'Silk Hijab - Emerald', price: 'Rp 120,000', originalPrice: 'Rp 180,000', seller: 'JKT_Partner_01', condition: 'Open Box', time: '5h ago' },
  { id: '3', item: 'Smart Watch - Black', price: 'Rp 450,000', originalPrice: 'Rp 650,000', seller: 'User_9921', condition: 'Brand New', time: '1d ago' },
];

/**
 * ResaleHubScreen - AceProxy C2C 本地二手转卖市场
 * 设计风格：清新、社区化、类似跳蚤市场的轻松感
 */
export const ResaleHubScreen = () => {
  const { currentTheme: theme } = useRole();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Resale Hub</Text>
          <Text style={styles.subtitle}>雅加达本地 C2C 现货转卖 • 100% 官方验货</Text>
        </View>
        <TouchableOpacity style={styles.sellBtn}>
          <Text style={styles.sellBtnText}>发布闲置</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_RESALE_ITEMS}
        numColumns={2}
        contentContainerStyle={styles.list}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, SHADOWS.soft]}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.conditionBadge}>{item.condition}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.itemName} numberOfLines={1}>{item.item}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.originalPrice}>{item.originalPrice}</Text>
              </View>
              <View style={styles.sellerRow}>
                <View style={styles.avatar} />
                <Text style={styles.sellerName}>{item.seller}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    padding: SPACING.lg, 
    backgroundColor: COLORS.white, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 4 },
  sellBtn: { backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  sellBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
  list: { padding: SPACING.sm },
  card: { 
    flex: 1, 
    margin: SPACING.sm, 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  imagePlaceholder: { height: 160, backgroundColor: '#F1F5F9', position: 'relative' },
  conditionBadge: { 
    position: 'absolute', 
    top: 10, 
    left: 10, 
    backgroundColor: 'rgba(15, 23, 42, 0.8)', 
    color: '#fff', 
    fontSize: 9, 
    paddingHorizontal: 6, 
    paddingVertical: 3, 
    borderRadius: 6,
    fontWeight: '700'
  },
  info: { padding: SPACING.md },
  itemName: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12 },
  price: { fontSize: 16, fontWeight: '900', color: '#8B5CF6' },
  originalPrice: { fontSize: 10, color: '#94A3B8', textDecorationLine: 'line-through' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#CBD5E1' },
  sellerName: { fontSize: 10, color: '#64748B', flex: 1, fontWeight: '600' },
  time: { fontSize: 9, color: '#94A3B8' }
});
