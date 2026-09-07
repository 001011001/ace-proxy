import React, { useState, useEffect, useCallback } from 'react';
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
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useProduct } from '../hooks/useProducts';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS, ROUNDED, SHADOWS, COMPONENTS, SURFACE, TEXT, SEMANTIC, BRAND } from '../theme';

const { width } = Dimensions.get('window');

const formatIdr = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const parseImages = (imageUrls: string | null): string[] => {
  if (!imageUrls) return [];
  try {
    const arr = JSON.parse(imageUrls);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route?.params || {};
  const { product, isLoading, error } = useProduct(productId);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const images = parseImages(product?.imageUrls || null);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      // TODO: Call actual addToCart API
      await new Promise(r => setTimeout(r, 500)); // simulate
      Alert.alert('Berhasil!', `${product.name} x${quantity} ditambahkan ke keranjang`);
    } catch (err) {
      Alert.alert('Error', 'Gagal menambahkan ke keranjang');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    Alert.alert('Checkout', `Memproses pesanan: ${product.name} x${quantity}`);
  };

  // ─── Loading state ───────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.consumer.primary} />
          <Text style={styles.loadingText}>Memuat produk...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error / Not Found ───────────────────────────────────
  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.center}>
          <Text style={styles.notFoundIcon}>▦</Text>
          <Text style={styles.notFoundTitle}>Produk tidak ditemukan</Text>
          <Text style={styles.notFoundSub}>
            {error || 'Produk ini mungkin sudah tidak tersedia'}
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const marginPct = product.costCny && product.priceIdr
    ? Math.round(((product.priceIdr - product.costCny * 2200) / product.priceIdr) * 100)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* ─── Image Gallery ─────────────────────────────── */}
        <View style={styles.gallery}>
          {images.length > 0 ? (
            <>
              <Image
                source={{ uri: images[selectedImageIdx] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailStrip}
                  contentContainerStyle={styles.thumbnailContent}
                >
                  {images.map((url, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedImageIdx(idx)}
                      style={[
                        styles.thumbnail,
                        selectedImageIdx === idx && styles.thumbnailActive,
                      ]}
                    >
                      <Image
                        source={{ uri: url }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>▦</Text>
              <Text style={styles.placeholderText}>Foto produk sedang diunggah</Text>
            </View>
          )}
        </View>

        {/* ─── Product Info ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.content}>
          {/* Category + Share */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              {product.category && (
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>
                    {product.category.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.productName}>{product.name}</Text>
            </View>
          </View>

          {/* ─── Price Stack (DESIGN.md signature) ────────── */}
          <View style={styles.priceCard}>
            {/* Original price strikethrough */}
            {product.costCny && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Harga Pasar Lokal</Text>
                <Text style={styles.originalPrice}>
                  ≈ Rp {(product.costCny * 2800).toLocaleString('id-ID')}
                </Text>
              </View>
            )}

            {/* AceProxy price */}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>HARGA ACEPROXY</Text>
              <Text style={styles.currentPrice}>{formatIdr(product.priceIdr)}</Text>
            </View>

            {/* CNY cost */}
            {product.costCny && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Biaya Sumber (1688)</Text>
                <Text style={styles.cnyCost}>¥ {product.costCny.toFixed(0)}</Text>
              </View>
            )}

            {/* Save badge */}
            {marginPct !== null && marginPct > 0 && (
              <View style={styles.saveRow}>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>
                    Hemat {marginPct}% vs Harga Pasar
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ─── Stock & Rating ──────────────────────────── */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Stok</Text>
              <Text style={[
                styles.metaValue,
                product.stock <= 5 && { color: SEMANTIC.error }
              ]}>
                {product.stock > 0 ? `${product.stock} unit` : 'Habis'}
              </Text>
            </View>
            {product.ratingAvg > 0 && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Rating</Text>
                <Text style={styles.metaValue}>
                  ★ {product.ratingAvg.toFixed(1)} ({product.ratingCount})
                </Text>
              </View>
            )}
          </View>

          {/* ─── Description ─────────────────────────────── */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DESKRIPSI PRODUK</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* ─── Trust Card (DESIGN.md: card-trust) ──────── */}
          <View style={styles.trustCard}>
            <View style={styles.trustHeader}>
              <Text style={styles.trustIcon}>🛡</Text>
              <Text style={styles.trustTitle}>JAMINAN ACEPROXY</Text>
            </View>
            <View style={styles.trustList}>
              <Text style={styles.trustItem}>✓ QC Visual oleh Agent kami di China</Text>
              <Text style={styles.trustItem}>✓ Harga sudah termasuk pajak impor</Text>
              <Text style={styles.trustItem}>✓ Pengiriman Cluster Logistics (Cepat & Murah)</Text>
              <Text style={styles.trustItem}>✓ Garansi kerusakan — kami ganti atau refund</Text>
            </View>
          </View>

          {/* ─── Price Comparison Bar ────────────────────── */}
          {marginPct !== null && marginPct > 0 && (
            <View style={styles.comparisonBar}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Harga Pasar</Text>
                <Text style={styles.comparisonValue}>
                  Rp {(product.costCny! * 2800).toLocaleString('id-ID')}
                </Text>
              </View>
              <View style={styles.comparisonDivider}>
                <View style={styles.comparisonBadge}>
                  <Text style={styles.comparisonBadgeText}>-{marginPct}%</Text>
                </View>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>AceProxy</Text>
                <Text style={styles.comparisonValueAce}>
                  {formatIdr(product.priceIdr)}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ─── Fixed Bottom Action Bar ─────────────────────── */}
      <View style={styles.actionBar}>
        {/* Quantity selector */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          disabled={isAddingToCart || product.stock <= 0}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color={COLORS.consumer.primary} />
          ) : (
            <Text style={styles.addToCartText}>+ Keranjang</Text>
          )}
        </TouchableOpacity>

        {/* Buy Now */}
        <TouchableOpacity
          style={[styles.buyBtn, product.stock <= 0 && styles.btnDisabled]}
          onPress={handleBuyNow}
          disabled={product.stock <= 0}
        >
          <Text style={styles.buyBtnText}>
            {product.stock <= 0 ? 'HABIS' : 'Beli Sekarang'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SURFACE.canvas,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.consumer.textMute,
    marginTop: SPACING.md,
  },
  notFoundIcon: {
    fontSize: 48,
    color: COLORS.consumer.textMute,
    marginBottom: SPACING.md,
  },
  notFoundTitle: {
    ...TYPOGRAPHY.headingSm,
    color: COLORS.consumer.text,
    marginBottom: SPACING.xs,
  },
  notFoundSub: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.consumer.textMute,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: ROUNDED.pill,
    backgroundColor: COLORS.consumer.primarySoft,
  },
  backBtnText: {
    ...TYPOGRAPHY.buttonMd,
    color: COLORS.consumer.primary,
  },

  // ─── Gallery ───────────────────────────────────────────────
  gallery: {
    width: width,
    aspectRatio: 1,
    backgroundColor: SURFACE.canvasGray,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: 0,
    right: 0,
  },
  thumbnailContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: ROUNDED.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: COLORS.consumer.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
    color: COLORS.consumer.textMute,
    marginBottom: SPACING.sm,
  },
  placeholderText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.consumer.textMute,
  },

  // ─── Content ───────────────────────────────────────────────
  content: {
    padding: SPACING.lg,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: BRAND.terracottaSoft,
    borderRadius: ROUNDED.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: SPACING.sm,
  },
  categoryPillText: {
    ...TYPOGRAPHY.badge,
    color: BRAND.terracotta,
  },
  productName: {
    ...TYPOGRAPHY.headingXl,
    color: COLORS.consumer.text,
    lineHeight: 32,
  },

  // ─── Price Card ────────────────────────────────────────────
  priceCard: {
    backgroundColor: SURFACE.canvasWarm,
    borderRadius: ROUNDED.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...BORDERS.hairline,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  priceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.consumer.textMute,
    fontWeight: '600',
  },
  originalPrice: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.consumer.textMute,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    ...TYPOGRAPHY.priceXxl,
    color: COLORS.consumer.text,
  },
  cnyCost: {
    ...TYPOGRAPHY.bodyMd,
    color: SEMANTIC.success,
    fontWeight: '600',
  },
  saveRow: {
    marginTop: SPACING.sm,
  },
  saveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: SEMANTIC.error,
    borderRadius: ROUNDED.pill,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  saveBadgeText: {
    ...TYPOGRAPHY.badge,
    color: TEXT.onPrimary,
  },

  // ─── Meta Row ──────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: SURFACE.hairline,
  },
  metaItem: {},
  metaLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.consumer.textMute,
    marginBottom: 2,
  },
  metaValue: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '600',
    color: COLORS.consumer.text,
  },

  // ─── Description ───────────────────────────────────────────
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headingSm,
    color: COLORS.consumer.text,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  description: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.consumer.textSecondary,
    lineHeight: 24,
  },

  // ─── Trust Card ────────────────────────────────────────────
  trustCard: {
    backgroundColor: BRAND.oceanSoft,
    borderRadius: ROUNDED.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  trustHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  trustIcon: {
    fontSize: 20,
  },
  trustTitle: {
    ...TYPOGRAPHY.headingSm,
    color: BRAND.ocean,
    fontWeight: '700',
  },
  trustList: {
    gap: SPACING.xs,
  },
  trustItem: {
    ...TYPOGRAPHY.bodySm,
    color: BRAND.ocean,
    lineHeight: 22,
    fontWeight: '500',
  },

  // ─── Comparison Bar ────────────────────────────────────────
  comparisonBar: {
    backgroundColor: SEMANTIC.warningSoft,
    borderRadius: ROUNDED.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  comparisonLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.consumer.textSecondary,
    fontWeight: '600',
  },
  comparisonValue: {
    ...TYPOGRAPHY.priceMd,
    color: COLORS.consumer.textMute,
    textDecorationLine: 'line-through',
  },
  comparisonDivider: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  comparisonBadge: {
    backgroundColor: SEMANTIC.error,
    borderRadius: ROUNDED.pill,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  comparisonBadgeText: {
    ...TYPOGRAPHY.badge,
    color: TEXT.onPrimary,
  },
  comparisonValueAce: {
    ...TYPOGRAPHY.priceLg,
    color: COLORS.consumer.primary,
  },

  // ─── Bottom Action Bar ─────────────────────────────────────
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    borderTopWidth: 1,
    borderColor: SURFACE.hairline,
    backgroundColor: SURFACE.canvas,
    gap: SPACING.sm,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: ROUNDED.pill,
    borderWidth: 1,
    borderColor: SURFACE.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE.canvas,
  },
  qtyBtnText: {
    fontSize: 18,
    color: COLORS.consumer.text,
    fontWeight: '600',
  },
  qtyValue: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '700',
    color: COLORS.consumer.text,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: ROUNDED.pill,
    borderWidth: 1.5,
    borderColor: COLORS.consumer.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addToCartText: {
    ...TYPOGRAPHY.buttonMd,
    color: COLORS.consumer.primary,
  },
  buyBtn: {
    flex: 1,
    height: 48,
    borderRadius: ROUNDED.pill,
    backgroundColor: COLORS.consumer.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: {
    ...TYPOGRAPHY.buttonMd,
    color: COLORS.consumer.textOnPrimary,
  },
  btnDisabled: {
    opacity: 0.4,
  },
});

export default ProductDetailScreen;
