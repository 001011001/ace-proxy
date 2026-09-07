import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight, Layout } from 'react-native-reanimated';
import { useProducts } from '../hooks/useProducts';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS, ROUNDED, SHADOWS, COMPONENTS, SURFACE, TEXT, SEMANTIC, BRAND } from '../theme';
import type { Product } from '../services/types';

const { width } = Dimensions.get('window');
const CARD_GAP = SPACING.sm;
const CARD_WIDTH = (width - SPACING.md * 2 - CARD_GAP) / 2;

// ─── Category data ────────────────────────────────────────────────
const CATEGORIES = [
  { key: '', label: 'Semua', icon: '▦' },
  { key: 'smartphones', label: 'HP', icon: '◈' },
  { key: 'accessories', label: 'Aksesoris', icon: '◇' },
  { key: 'skincare', label: 'Skincare', icon: '◆' },
  { key: 'makeup', label: 'Makeup', icon: '◎' },
  { key: 'muslim_fashion', label: 'Busana', icon: '◉' },
  { key: 'mom_baby', label: 'Ibu & Bayi', icon: '◐' },
  { key: 'home_living', label: 'Rumah', icon: '◑' },
];

const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: 'newest', label: 'Terbaru' },
  { key: 'popular', label: 'Populer' },
  { key: 'price_asc', label: 'Termurah' },
  { key: 'price_desc', label: 'Termahal' },
];

// ─── Helpers ──────────────────────────────────────────────────────
const formatIdr = (n: number) => {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}JT`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}Rb`;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

const parseImageUrl = (imageUrls: string | null): string | null => {
  if (!imageUrls) return null;
  try {
    const arr = JSON.parse(imageUrls);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
  } catch {
    return null;
  }
};

const getMarginPct = (product: Product): number | null => {
  if (!product.costCny || !product.priceIdr) return null;
  const costIdr = product.costCny * 2200; // rough CNY→IDR
  if (costIdr <= 0) return null;
  return Math.round(((product.priceIdr - costIdr) / product.priceIdr) * 100);
};

// ─── Category icon ────────────────────────────────────────────────
const categoryIcon = (cat: string | null) => {
  const map: Record<string, string> = {
    smartphones: '◈', accessories: '◇', skincare: '◆', makeup: '◎',
    muslim_fashion: '◉', mom_baby: '◐', home_living: '◑',
  };
  return map[cat || ''] || '▦';
};

// ─── Product Card ─────────────────────────────────────────────────
const ProductCard = React.memo(({ item, index, onPress }: {
  item: Product;
  index: number;
  onPress: (product: Product) => void;
}) => {
  const imageUrl = parseImageUrl(item.imageUrls);
  const marginPct = getMarginPct(item);

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 60).duration(400)}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() => onPress(item)}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>
                {categoryIcon(item.category)}
              </Text>
            </View>
          )}
          {/* Save badge */}
          {marginPct !== null && marginPct > 0 && (
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>-{marginPct}%</Text>
            </View>
          )}
          {/* Stock badge */}
          {item.stock <= 0 && (
            <View style={styles.oosOverlay}>
              <Text style={styles.oosText}>HABIS</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Category pill */}
          {item.category && (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText} numberOfLines={1}>
                {item.category.replace(/_/g, ' ')}
              </Text>
            </View>
          )}

          {/* Product name */}
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Price Stack (DESIGN.md signature) */}
          <View style={styles.priceStack}>
            {/* Original price (strikethrough) */}
            {item.costCny && (
              <Text style={styles.originalPrice}>
                ≈ Rp {(item.costCny * 2200).toLocaleString('id-ID')}
              </Text>
            )}
            {/* Current price */}
            <Text style={styles.currentPrice}>
              {formatIdr(item.priceIdr)}
            </Text>
            {/* CNY cost */}
            {item.costCny && (
              <Text style={styles.cnyCost}>
                ¥ {item.costCny.toFixed(0)} (1688)
              </Text>
            )}
          </View>

          {/* Rating & stock */}
          <View style={styles.metaRow}>
            {item.ratingAvg > 0 && (
              <Text style={styles.rating}>★ {item.ratingAvg.toFixed(1)}</Text>
            )}
            <Text style={styles.stock}>
              {item.stock > 0 ? `Stok: ${item.stock}` : 'Habis'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────
export const DiscoverScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSort, setActiveSort] = useState('newest');
  const [showSortPicker, setShowSortPicker] = useState(false);

  // Debounce search input (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { products, isLoading, error, loadMore, hasMore, refresh } = useProducts({
    category: activeCategory || undefined,
    search: debouncedSearch || undefined,
    sortBy: activeSort,
    pageSize: 20,
  });

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductCard item={item} index={index} onPress={handleProductPress} />
  ), [handleProductPress]);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  // ─── Header component ───────────────────────────────────────
  const ListHeader = useMemo(() => (
    <View>
      {/* Search Bar (DESIGN.md: pill search bar) */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari produk... (HP, baju, skincare)"
            placeholderTextColor={COLORS.consumer.textMute}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
        {/* Sort button */}
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSortPicker(!showSortPicker)}
        >
          <Text style={styles.sortBtnText}>⇅</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Sort picker */}
      {showSortPicker && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.sortPicker}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortOption, activeSort === opt.key && styles.sortOptionActive]}
              onPress={() => { setActiveSort(opt.key); setShowSortPicker(false); }}
            >
              <Text style={[
                styles.sortOptionText,
                activeSort === opt.key && styles.sortOptionTextActive,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Category Chips (DESIGN.md: pill-tag) */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(c) => c.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                activeCategory === cat.key && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <Text style={[
                styles.categoryChipText,
                activeCategory === cat.key && styles.categoryChipTextActive,
              ]}>
                {cat.icon}  {cat.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeCategory
            ? CATEGORIES.find(c => c.key === activeCategory)?.label || 'Produk'
            : 'Semua Produk'}
        </Text>
        <Text style={styles.sectionCount}>
          {products.length} produk
        </Text>
      </View>
    </View>
  ), [searchQuery, activeCategory, activeSort, showSortPicker, products.length]);

  // ─── Empty state ────────────────────────────────────────────
  const ListEmpty = useMemo(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>▦</Text>
        <Text style={styles.emptyTitle}>Belum ada produk</Text>
        <Text style={styles.emptySub}>
          Coba kategori lain atau periksa kembali nanti
        </Text>
      </View>
    );
  }, [isLoading]);

  // ─── Footer loader ──────────────────────────────────────────
  const ListFooter = useMemo(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.consumer.primary} />
      </View>
    );
  }, [hasMore]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.consumer.background} />

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        onRefresh={refresh}
        refreshing={isLoading && products.length > 0}
        showsVerticalScrollIndicator={false}
        layout={Layout.springify()}
      />
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.consumer.background,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.massive,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // ─── Search ─────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE.canvasGray,
    borderRadius: ROUNDED.pill,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  searchIcon: {
    fontSize: 18,
    color: COLORS.consumer.textMute,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.consumer.text,
    padding: 0,
  },
  sortBtn: {
    width: 44,
    height: 44,
    borderRadius: ROUNDED.pill,
    backgroundColor: SURFACE.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    ...BORDERS.hairline,
  },
  sortBtnText: {
    fontSize: 18,
    color: COLORS.consumer.textSecondary,
  },

  // ─── Sort Picker ────────────────────────────────────────────
  sortPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  sortOption: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: ROUNDED.pill,
    backgroundColor: SURFACE.canvas,
    ...BORDERS.hairline,
  },
  sortOptionActive: {
    backgroundColor: COLORS.consumer.primary,
    borderColor: COLORS.consumer.primary,
  },
  sortOptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.consumer.textSecondary,
    fontWeight: '600',
  },
  sortOptionTextActive: {
    color: COLORS.consumer.textOnPrimary,
  },

  // ─── Categories ─────────────────────────────────────────────
  categoryRow: {
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: ROUNDED.pill,
    backgroundColor: SURFACE.canvas,
    ...BORDERS.hairline,
  },
  categoryChipActive: {
    backgroundColor: COLORS.consumer.primary,
    borderColor: COLORS.consumer.primary,
  },
  categoryChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.consumer.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: COLORS.consumer.textOnPrimary,
  },

  // ─── Section Header ─────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headingSm,
    color: COLORS.consumer.text,
  },
  sectionCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.consumer.textMute,
  },

  // ─── Product Card ───────────────────────────────────────────
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: SURFACE.canvas,
    borderRadius: ROUNDED.lg,
    borderWidth: 1,
    borderColor: SURFACE.hairline,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: SURFACE.canvasGray,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE.canvasGray,
  },
  imagePlaceholderIcon: {
    fontSize: 36,
    color: COLORS.consumer.textMute,
  },
  saveBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: SEMANTIC.error,
    borderRadius: ROUNDED.pill,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  saveBadgeText: {
    ...TYPOGRAPHY.badge,
    color: TEXT.onPrimary,
  },
  oosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oosText: {
    ...TYPOGRAPHY.badge,
    color: '#fff',
    fontSize: 16,
  },

  // ─── Card Content ───────────────────────────────────────────
  cardContent: {
    padding: SPACING.md,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: BRAND.terracottaSoft,
    borderRadius: ROUNDED.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: SPACING.xs,
  },
  categoryPillText: {
    ...TYPOGRAPHY.micro,
    color: BRAND.terracotta,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  productName: {
    ...TYPOGRAPHY.bodySm,
    fontWeight: '600',
    color: COLORS.consumer.text,
    lineHeight: 18,
    marginBottom: SPACING.sm,
    height: 36,
  },

  // ─── Price Stack (DESIGN.md signature) ──────────────────────
  priceStack: {
    marginBottom: SPACING.sm,
  },
  originalPrice: {
    ...TYPOGRAPHY.micro,
    color: COLORS.consumer.textMute,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    ...TYPOGRAPHY.priceLg,
    color: COLORS.consumer.text,
    marginTop: 2,
  },
  cnyCost: {
    ...TYPOGRAPHY.micro,
    color: SEMANTIC.success,
    fontWeight: '600',
    marginTop: 2,
  },

  // ─── Meta Row ───────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    ...TYPOGRAPHY.micro,
    color: SEMANTIC.warning,
    fontWeight: '700',
  },
  stock: {
    ...TYPOGRAPHY.micro,
    color: COLORS.consumer.textMute,
  },

  // ─── Empty State ────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.massive,
  },
  emptyIcon: {
    fontSize: 48,
    color: COLORS.consumer.textMute,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headingSm,
    color: COLORS.consumer.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySub: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.consumer.textMute,
    textAlign: 'center',
  },

  // ─── Footer ─────────────────────────────────────────────────
  footerLoader: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
});


