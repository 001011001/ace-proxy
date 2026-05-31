import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

/**
 * ProductDetailScreen - 高转化率商品详情页
 * 核心：直观对比“采购价”与“市场价”，可视化“采购优势”
 */
export const ProductDetailScreen = ({ route }) => {
  const { currentTheme: theme } = useRole();
  const product = {
    name: 'Industrial Grade Vacuum Sealer - Elite Edition',
    sourcingPrice: 'Rp 450,000',
    marketPrice: 'Rp 850,000',
    advantage: 'Rp 400,000',
    advantagePct: '47%',
    rating: 4.9,
    reviews: 128,
    estimatedDelivery: '5-7 Days',
    source: 'Factory Direct'
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <View style={styles.placeholderImg} />
          <TouchableOpacity style={styles.backBtn}>
            <Text style={{ fontSize: 20 }}>⬅️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.advantageBadge}>
            <Text style={styles.advantageText}>🔥 Sourcing Advantage: {product.advantagePct} OFF</Text>
          </View>
          
          <Text style={styles.title}>{product.name}</Text>
          
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Your Direct Price</Text>
              <Text style={styles.sourcingPrice}>{product.sourcingPrice}</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.priceLabel}>Shopee Price</Text>
              <Text style={styles.marketPrice}>{product.marketPrice}</Text>
            </View>
          </View>

          <View style={[styles.savingCard, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
            <Text style={styles.savingTitle}>You Save {product.advantage} per unit</Text>
            <Text style={styles.savingSub}>Based on Jakarta market average</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Delivery</Text>
              <Text style={styles.infoValue}>{product.estimatedDelivery}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rating</Text>
              <Text style={styles.infoValue}>⭐ {product.rating} ({product.reviews} reviews)</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Description</Text>
          <Text style={styles.description}>
            This professional-grade vacuum sealer is sourced directly from specialized factories. 
            Perfect for bulk food storage and reducing logistics volume (vacuum compression arbitrage).
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, SHADOWS.medium]}>
        <TouchableOpacity style={styles.wishlistBtn}>
          <Text style={{ fontSize: 24 }}>🤍</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buyBtn, { backgroundColor: '#F97316' }]}>
          <Text style={styles.buyBtnText}>Confirm Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  imageContainer: { width: width, height: width, backgroundColor: '#F1F5F9', position: 'relative' },
  placeholderImg: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING.lg },
  advantageBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  advantageText: { color: '#EF4444', fontSize: 12, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 24 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  priceLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  sourcingPrice: { fontSize: 24, fontWeight: '900', color: '#F97316' },
  divider: { width: 1, height: 40, backgroundColor: '#E2E8F0', mx: 24, marginHorizontal: 24 },
  marketPrice: { fontSize: 18, fontWeight: '700', color: '#94A3B8', textDecorationLine: 'line-through' },
  savingCard: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 32 },
  savingTitle: { fontSize: 15, fontWeight: '900', color: '#9A3412' },
  savingSub: { fontSize: 12, color: '#C2410C', marginTop: 2, fontWeight: '500' },
  infoSection: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingVertical: 20, marginBottom: 24 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '800', color: '#334155' },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  description: { fontSize: 14, color: '#64748B', lineHeight: 22, fontWeight: '500' },
  footer: { padding: SPACING.lg, paddingBottom: 40, flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  wishlistBtn: { width: 60, height: 60, borderRadius: 20, borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  buyBtn: { flex: 1, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  buyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' }
});
