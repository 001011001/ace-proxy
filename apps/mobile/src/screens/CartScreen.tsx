import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

const MOCK_CART = [
  { id: '1', item: 'Vacuum Storage Bag', price: 'Rp 45,000', qty: 10 },
  { id: '2', item: 'Ramadan LED Lights', price: 'Rp 29,900', qty: 5 },
];

export const CartScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
      </View>
      
      <FlatList
        data={MOCK_CART}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, SHADOWS.soft]}>
            <View style={styles.imgPlaceholder} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.itemName}>{item.item}</Text>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>Quantity: {item.qty}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, SHADOWS.medium]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Advantage Price</Text>
          <Text style={styles.totalPrice}>Rp 599,500</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: SPACING.lg, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  list: { padding: SPACING.md },
  itemCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, flexDirection: 'row', marginBottom: 12 },
  imgPlaceholder: { width: 80, height: 80, backgroundColor: '#F1F5F9', borderRadius: 12 },
  itemName: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#F97316', marginTop: 4 },
  qtyRow: { marginTop: 12 },
  qtyLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  footer: { padding: 24, backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  totalPrice: { fontSize: 20, fontWeight: '900', color: '#1E293B' },
  checkoutBtn: { backgroundColor: '#F97316', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  checkoutText: { color: '#FFF', fontSize: 16, fontWeight: '900' }
});
