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
import { COLORS, SPACING, TYPOGRAPHY, BORDERS, SHADOWS } from '../theme';
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
    Alert.alert('Konfirmasi Checkout', 'Lanjut ke pembayaran via WorldFirst?');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KERANJANG (CART)</Text>
        <Text style={styles.headerSub}>{cartItems.length} ITEMS READY FOR SHIPPING</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logistics Strategy Banner */}
        <HubProgressBar 
          hubName="Jakarta Utara (北区)" 
          current={44} 
          target={50} 
        />

        <View style={styles.cartList}>
          {loading ? (
            <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 40 }} />
          ) : cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={styles.emptyCartText}>Keranjang kosong (Cart is empty)</Text>
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
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, -1)}><Text>-</Text></TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.id, 1)}><Text>+</Text></TouchableOpacity>
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
          <View style={[styles.summaryRow, { marginTop: 12, borderTopWidth: 2, paddingTop: 12 }]}>
            <Text style={styles.totalLabel}>TOTAL ESTIMASI</Text>
            <Text style={styles.totalVal}>Rp {(total + 150000).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.promoText}>💡 Tips: Tambah 6kg lagi untuk aktifkan "Prioritas Udara" (Priority Air Express)!</Text>
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
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { padding: SPACING.lg, backgroundColor: '#fff', borderBottomWidth: 4, borderColor: '#000' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#000' },
  headerSub: { fontSize: 11, fontWeight: '800', color: COLORS.gray[400], marginTop: 4 },
  scrollContent: { padding: SPACING.md },
  cartList: { marginVertical: 20 },
  cartItem: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 16, 
    ...BORDERS.brutalist, 
    marginBottom: 12,
    alignItems: 'center'
  },
  itemImage: { width: 60, height: 60, backgroundColor: COLORS.gray[100], marginRight: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '900', color: '#000' },
  itemMeta: { fontSize: 12, color: COLORS.gray[400], fontWeight: '600', marginVertical: 4 },
  itemPrice: { fontSize: 14, fontWeight: '900', color: '#F97316' },
  qtyControls: { alignItems: 'center', gap: 4 },
  qtyBtn: { width: 28, height: 28, ...BORDERS.brutalist, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  qtyText: { fontSize: 14, fontWeight: '900' },
  summaryCard: { backgroundColor: '#fff', padding: 20, ...BORDERS.brutalist, ...SHADOWS.brutalist },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: COLORS.gray[500], fontWeight: '600' },
  summaryVal: { fontSize: 13, color: '#000', fontWeight: '800' },
  totalLabel: { fontSize: 15, fontWeight: '900', color: '#000' },
  totalVal: { fontSize: 20, fontWeight: '900', color: '#F97316' },
  promoCard: { marginTop: 20, padding: 16, backgroundColor: '#FFF7ED', borderLeftWidth: 6, borderColor: '#F97316' },
  promoText: { fontSize: 13, fontWeight: '800', color: '#9A3412', lineHeight: 20 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 4, borderColor: '#000' },
  checkoutBtn: { 
    height: 64, 
    backgroundColor: '#F97316', 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist
  },
  checkoutText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  emptyCart: { padding: 40, alignItems: 'center' },
  emptyCartText: { fontSize: 16, fontWeight: '900', color: COLORS.gray[400], marginBottom: 8 },
  emptyCartSub: { fontSize: 13, color: COLORS.gray[300], fontWeight: '600' }
});
