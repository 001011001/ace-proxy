import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

const MOCK_ORDERS = [
  { id: '1', item: 'Gamis Syari Premium', status: 'IN_TRANSIT', date: '2026-05-30', price: 'Rp 485,000', location: 'Jakarta Hub' },
  { id: '2', item: 'LED Ramadan Lights', status: 'DELIVERED', date: '2026-05-28', price: 'Rp 65,000', location: 'Customer' },
  { id: '3', item: 'Vacuum Bag Set', status: 'PENDING', date: '2026-05-31', price: 'Rp 45,000', location: 'Shenzhen Warehouse' },
];

export const OrderListScreen = () => {
  const { role, currentTheme: theme, t } = useRole();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return COLORS.success;
      case 'IN_TRANSIT': return theme.primary;
      case 'PENDING': return COLORS.gray[400];
      default: return COLORS.gray[800];
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>
          {role === 'RIDER' ? '派送任务' : '我的订单'}
        </Text>
      </View>
      <FlatList
        data={MOCK_ORDERS}
        contentContainerStyle={styles.list}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.orderCard, SHADOWS.soft]}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderDate}>{item.date}</Text>
              <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
            <Text style={styles.itemName}>{item.item}</Text>
            <View style={styles.orderFooter}>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.location}>📍 {item.location}</Text>
            </View>
            {role === 'RIDER' && item.status === 'IN_TRANSIT' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
                <Text style={styles.actionBtnText}>确认送达 (POD)</Text>
              </TouchableOpacity>
            )}
            {role === 'USER' && item.status === 'DELIVERED' && (
              <TouchableOpacity style={[styles.resellBtn, SHADOWS.soft]}>
                <Text style={styles.resellBtnText}>♻️ 一键转卖 (Resale Hub)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* WhatsApp Floating Service Ball */}
      <TouchableOpacity 
        style={[styles.waFab, SHADOWS.medium]}
        onPress={() => console.log('Open WhatsApp Support')}
      >
        <Text style={{ fontSize: 24 }}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { padding: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  title: { ...TYPOGRAPHY.h1, fontSize: 24, fontWeight: '900' },
  list: { padding: SPACING.md },
  orderCard: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: 20, marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderDate: { fontSize: 12, color: COLORS.gray[400], fontWeight: '600' },
  status: { fontSize: 12, fontWeight: '800' },
  itemName: { ...TYPOGRAPHY.body, fontWeight: '800', fontSize: 16, marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '900', color: COLORS.gray[800] },
  location: { fontSize: 12, color: COLORS.gray[500], fontWeight: '500' },
  actionBtn: { marginTop: 16, padding: 12, borderRadius: 12, alignItems: 'center' },
  actionBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  resellBtn: { marginTop: 16, padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  resellBtnText: { color: '#8B5CF6', fontWeight: '800', fontSize: 13 },
  waFab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  }
});
