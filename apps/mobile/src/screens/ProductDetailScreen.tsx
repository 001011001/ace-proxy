import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS, SHADOWS } from '../theme';
import { api } from '../services/APIService';

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route?.params || {};
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSku, setSelectedSku] = useState('XL');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) {
      loadProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await api.getProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      // TODO: Call actual addToCart API when available
      Alert.alert('Added', `${product.name || 'Item'} x${quantity} added to cart`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: COLORS.gray[400], marginBottom: 8 }}>
            Product not found
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.gray[300] }}>
            This product may no longer be available
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Gallery */}
        <View style={styles.imageGallery}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>PREMIUM_ABAYA_IMAGE</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.category}>{product.category?.toUpperCase() || 'PRODUCT'}</Text>
              <Text style={styles.productName}>{product.name || 'Product Details'}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn}>
              <Text>🔗</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>HARGA JAKARTA (IDR)</Text>
            <Text style={styles.price}>Rp {(product.localPriceIdr || 0).toLocaleString()}</Text>
            <View style={styles.priceComparison}>
              <Text style={styles.comparisonText}>≈ ¥ {(product.sourcePriceCny || 0).toFixed(2)} (Source: 1688)</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>PILIH UKURAN (SIZE)</Text>
          <View style={styles.skuRow}>
            {['M', 'L', 'XL', 'XXL'].map(size => (
              <TouchableOpacity 
                key={size}
                style={[styles.skuItem, selectedSku === size && styles.skuItemSelected]}
                onPress={() => setSelectedSku(size)}
              >
                <Text style={[styles.skuText, selectedSku === size && styles.skuTextSelected]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>DESKRIPSI PRODUK</Text>
          <Text style={styles.description}>
            {product.description || 'Product description not available.'}
          </Text>

          <View style={styles.trustCard}>
            <Text style={styles.trustTitle}>🛡️ JAMINAN ACEPROXY</Text>
            <Text style={styles.trustContent}>
              • QC Visual oleh Agent kami di China.{"\n"}
              • Harga sudah termasuk pajak impor.{"\n"}
              • Pengiriman Cluster Logistics (Cepat & Murah).
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.cartIcon}>
          <Text style={{ fontSize: 24 }}>🛒</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.btnText}>TAMBAH KE KERANJANG</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageGallery: { width: width, height: width, backgroundColor: COLORS.gray[50] },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 18, fontWeight: '900', color: COLORS.gray[300] },
  content: { padding: SPACING.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  category: { fontSize: 10, fontWeight: '900', color: '#F97316', marginBottom: 4 },
  productName: { fontSize: 24, fontWeight: '900', color: '#000', flex: 1, marginRight: 16 },
  shareBtn: { width: 44, height: 44, ...BORDERS.brutalist, justifyContent: 'center', alignItems: 'center' },
  priceContainer: { marginBottom: 24, padding: 16, backgroundColor: '#F8FAFC', ...BORDERS.brutalist },
  priceLabel: { fontSize: 10, fontWeight: '900', color: COLORS.gray[400], marginBottom: 4 },
  price: { fontSize: 32, fontWeight: '900', color: '#000' },
  priceComparison: { marginTop: 4 },
  comparisonText: { fontSize: 11, color: '#10B981', fontWeight: '700' },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#000', marginTop: 20, marginBottom: 12, textTransform: 'uppercase' },
  skuRow: { flexDirection: 'row', gap: 10 },
  skuItem: { paddingHorizontal: 20, paddingVertical: 10, ...BORDERS.brutalist, backgroundColor: '#fff' },
  skuItemSelected: { backgroundColor: '#000' },
  skuText: { fontSize: 14, fontWeight: '900', color: '#000' },
  skuTextSelected: { color: '#fff' },
  description: { fontSize: 14, lineHeight: 22, color: COLORS.gray[600], fontWeight: '500' },
  trustCard: { marginTop: 30, padding: 20, backgroundColor: '#F0FDFA', borderLeftWidth: 8, borderColor: '#10B981' },
  trustTitle: { fontSize: 14, fontWeight: '900', color: '#0F766E', marginBottom: 8 },
  trustContent: { fontSize: 13, color: '#115E59', lineHeight: 20, fontWeight: '500' },
  actionBar: { 
    flexDirection: 'row', 
    padding: 16, 
    borderTopWidth: 4, 
    borderColor: '#000', 
    backgroundColor: '#fff', 
    alignItems: 'center',
    gap: 16
  },
  cartIcon: { width: 60, height: 60, ...BORDERS.brutalist, justifyContent: 'center', alignItems: 'center' },
  badge: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    backgroundColor: '#F97316', 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000'
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  addToCartBtn: { 
    flex: 1, 
    height: 60, 
    backgroundColor: '#F97316', 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '900' }
});
