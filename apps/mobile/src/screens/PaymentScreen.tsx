import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

/**
 * PaymentScreen - Xendit 支付收银台 (印尼站适配)
 * 支持 Bank Transfer, E-Wallet (OVO, DANA, Gopay) 等本地支付方式。
 */
export const PaymentScreen = ({ orderTotal = '2,450,000' }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.label}>应付金额 (IDR)</Text>
        <Text style={styles.amount}>Rp {orderTotal}</Text>
        <Text style={styles.exchangeNote}>≈ ¥ 1,108.60 RMB (含 5% FX Buffer)</Text>
      </View>

      <Text style={styles.sectionTitle}>选择本地支付方式 (Xendit Gateway)</Text>

      {/* 虚拟账户 VA */}
      <View style={styles.methodGroup}>
        <Text style={styles.groupLabel}>Bank Transfer (Virtual Account)</Text>
        <TouchableOpacity style={styles.method}><Text>Mandiri VA</Text></TouchableOpacity>
        <TouchableOpacity style={styles.method}><Text>BCA VA</Text></TouchableOpacity>
        <TouchableOpacity style={styles.method}><Text>BNI VA</Text></TouchableOpacity>
      </View>

      {/* 电子钱包 */}
      <View style={styles.methodGroup}>
        <Text style={styles.groupLabel}>E-Wallet</Text>
        <View style={styles.walletRow}>
          <TouchableOpacity style={styles.walletBtn}><Text>Gopay</Text></TouchableOpacity>
          <TouchableOpacity style={styles.walletBtn}><Text>OVO</Text></TouchableOpacity>
          <TouchableOpacity style={styles.walletBtn}><Text>DANA</Text></TouchableOpacity>
        </View>
      </View>

      {/* 便利店支付 */}
      <View style={styles.methodGroup}>
        <Text style={styles.groupLabel}>Over-the-Counter</Text>
        <TouchableOpacity style={styles.method}><Text>Alfamart / Indomaret</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.payButton}>
        <Text style={styles.payText}>确认并支付</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  summary: { padding: 30, backgroundColor: '#fff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 14, color: '#888' },
  amount: { fontSize: 32, fontWeight: 'bold', color: '#000', marginVertical: 10 },
  exchangeNote: { fontSize: 12, color: '#ffa940' },
  sectionTitle: { padding: 20, fontSize: 16, fontWeight: 'bold' },
  methodGroup: { backgroundColor: '#fff', padding: 15, marginBottom: 10 },
  groupLabel: { fontSize: 12, color: '#999', marginBottom: 10 },
  method: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  walletBtn: { width: '30%', padding: 12, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', borderRadius: 4 },
  payButton: { margin: 20, padding: 18, backgroundColor: '#000', borderRadius: 8, alignItems: 'center' },
  payText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
