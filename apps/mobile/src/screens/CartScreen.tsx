import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS, ROUNDED, SHADOWS } from '../theme';
import { HubProgressBar } from '../components/HubProgressBar';
import { api } from '../services/APIService';

export const CartScreen = ({ navigation }: any) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await api.getCart();
      setCartItems(data?.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
    // TODO: Sync with backend when cart update API is ready
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    Alert.alert('Konfirmasi Checkout', 'Lanjut ke pembayaran?');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keranjang (Cart)</Text>
        <Text style={styles.headerSub}>{cartItems.length} ITEMS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logistics Strategy Banner */}
        <HubProgressBar 
          hubName="Jakarta Utara" 
          current={44} 
          target={50} 
        />

        <View style={styles.cartList}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.consumer.primary} style={{ marginTop: 40 }} />
          ) : cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>Keranjang kosong</Text>
              <Text style={styles.emptyCartSub}>Start shopping to add items here</Text>
            </View>
          ) : (
            cartItems.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>Size: {item.size}</Text>
                  <Text style={styles.itemPrice}>Rp {(item.price * item.qty).toLocaleString()}</Text>
                </View>
                <View style={styles.qtyControls}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>Rp {total.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimasi Pajak & QC</Text>
            <Text style={styles.summaryVal}>Rp 150,000</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.consumer.primarySoft, paddingTop: 12 }]}>
            <Text style={styles.totalLabel}>TOTAL ESTIMASI</Text>
            <Text style={styles.totalVal}>Rp {(total + 150000).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.promoText}>Tambahkan 6kg lagi untuk mengaktifkan "Prioritas Udara" (Priority Air Express)!</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>LANJUT PEMBAYARAN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.consumer.background },
  header: { padding: SPACING.lg, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.consumer.primarySoft },
  headerTitle: { ...TYPOGRAPHY.headingXl, color: COLORS.consumer.text },
  headerSub: { ...TYPOGRAPHY.caption, color: COLORS.consumer.textMute, marginTop: 4 },
  scrollContent: { padding: SPACING.md },
  cartList: { marginVertical: 16 },
  cartItem: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: ROUNDED.lg,
    ...BORDERS.hairline, 
    marginBottom: 12,
    alignItems: 'center'
  },
  itemImage: { width: 60, height: 60, backgroundColor: COLORS.gray[100], borderRadius: ROUNDED.sm, marginRight: 16 },
  itemInfo: { flex: 1 },
  itemName: { ...TYPOGRAPHY.headingSm, color: COLORS.consumer.text },
  itemMeta: { ...TYPOGRAPHY.caption, color: COLORS.consumer.textMute, marginVertical: 4 },
  itemPrice: { ...TYPOGRAPHY.priceMd, color: COLORS.consumer.primary },
  qtyControls: { alignItems: 'center', gap: 4 },
  qtyBtn: { 
    width: 32, 
    height: 32, 
    borderRadius: ROUNDED.pill, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.consumer.primarySoft,
  },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.consumer.primary },
  qtyText: { ...TYPOGRAPHY.bodyMd, fontWeight: '700', color: COLORS.consumer.text },
  summaryCard: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: ROUNDED.lg,
    ...BORDERS.hairline,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { ...TYPOGRAPHY.bodySm, color: COLORS.consumer.textMute },
  summaryVal: { ...TYPOGRAPHY.bodySm, color: COLORS.consumer.text, fontWeight: '700' },
  totalLabel: { ...TYPOGRAPHY.headingSm, color: COLORS.consumer.text },
  totalVal: { ...TYPOGRAPHY.priceLg, color: COLORS.consumer.primary },
  promoCard: { 
    marginTop: 20, 
    padding: 16, 
    backgroundColor: COLORS.consumer.primarySoft, 
    borderRadius: ROUNDED.md,
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.consumer.primary,
  },
  promoText: { ...TYPOGRAPHY.bodySm, color: COLORS.consumer.primary, lineHeight: 20, fontWeight: '600' },
  footer: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: COLORS.consumer.primarySoft,
  },
  checkoutBtn: { 
    height: 56, 
    backgroundColor: COLORS.consumer.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: ROUNDED.pill,
  },
  checkoutText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  emptyCart: { padding: 40, alignItems: 'center' },
  emptyCartText: { ...TYPOGRAPHY.headingMd, color: COLORS.consumer.textMute, marginBottom: 8 },
  emptyCartSub: { ...TYPOGRAPHY.bodySm, color: COLORS.consumer.textMute }
});
