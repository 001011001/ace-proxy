import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Modal,
  Alert
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

/**
 * PaymentScreen - 万里汇 (WorldFirst) 收银台 (试点期唯一路径)
 * 支持 Bank Transfer - Local Bank (IDR)。
 * 用户需上传支付凭证 (Proof of Payment) 以供后台核销。
 */
export const PaymentScreen = ({ route, navigation }: any) => {
  const { orderId, orderTotal } = route?.params || {};
  const { currentTheme: theme } = useRole();
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [proofUploaded, setProofUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);

  const handleUploadProof = async () => {
    try {
      setUploading(true);
      // TODO: Use expo-image-picker when dependency is added
      // const result = await ImagePicker.launchImageLibraryAsync({...});
      // if (!result.canceled) {
      //   setProofUri(result.uri);
      //   await api.uploadPaymentProof(orderId, result.uri);
      //   setProofUploaded(true);
      // }
      Alert.alert('Coming Soon', 'Payment proof upload will be available in next update');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!proofUploaded) {
      Alert.alert('Error', 'Please upload payment proof first');
      return;
    }
    try {
      // TODO: Call actual API
      // await api.confirmPayment(orderId);
      Alert.alert('Success', 'Payment confirmed!', [
        { text: 'OK', onPress: () => navigation?.navigate('Home') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm payment');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.summary}>
          <Text style={styles.label}>应付金额 (IDR)</Text>
          <Text style={styles.amount}>Rp {orderTotal || '---'}</Text>
          <View style={styles.exchangeBadge}>
            <Text style={styles.exchangeNote}>≈ ¥ 1,108.60 RMB (WorldFirst 结汇预估)</Text>
          </View>
        </Animated.View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>支付方式: 万里汇本地转账</Text>

          <View style={styles.methodGroup}>
             <View style={styles.bankDetailCard}>
                <Text style={styles.bankName}>CITIBANK INDONESIA</Text>
                <Text style={styles.bankAccount}>8829 **** **** 1022</Text>
                <Text style={styles.beneficiary}>Name: ACEPROXY STEWARD</Text>
                <TouchableOpacity onPress={() => Alert.alert('已复制', '账号已复制到剪贴板')}>
                   <Text style={styles.copyText}>Salin Nomor Rekening (复制账号)</Text>
                </TouchableOpacity>
             </View>
          </View>

          <Text style={styles.sectionTitle}>上传凭证 (Bukti Transfer)</Text>
          <TouchableOpacity 
            style={styles.uploadArea} 
            onPress={handleUploadProof}
            disabled={uploading}
          >
            <Text style={styles.uploadText}>
               {uploading ? 'Uploading...' : proofUploaded ? '✅ Bukti Terunggah (凭证已上传)' : '📸 Upload Bukti Transfer'}
            </Text>
          </TouchableOpacity>

          <View style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Text style={{ fontSize: 16 }}>⚠️</Text>
              <Text style={styles.noticeTitle}>Pengingat Jastip (Proxy Reminder)</Text>
            </View>
            <Text style={styles.noticeContent}>
              Pesanan akan diproses setelah verifikasi pembayaran manual oleh admin.
            </Text>
          </View>

          {/* Agreement Checkbox */}
          <TouchableOpacity 
            style={styles.agreementRow} 
            onPress={() => setAgreementConfirmed(!agreementConfirmed)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox, 
              agreementConfirmed && { backgroundColor: '#F97316', borderColor: '#F97316' }
            ]}>
              {agreementConfirmed && <View style={styles.checkInner} />}
            </View>
            <Text style={styles.agreementText}>
              我已阅读并同意 <Text style={{ color: '#F97316', fontWeight: '700' }}>《跨境代购免责契约》</Text>。
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.payButton, 
              { backgroundColor: (agreementConfirmed && proofUploaded) ? '#F97316' : COLORS.gray[300] }, 
              agreementConfirmed && SHADOWS.medium
            ]}
            onPress={handleSubmit}
            disabled={!agreementConfirmed || !proofUploaded}
          >
            <Text style={styles.payText}>提交核销 (Konfirmasi)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  summary: { 
    padding: 40, 
    backgroundColor: COLORS.white, 
    alignItems: 'center', 
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...SHADOWS.soft
  },
  label: { fontSize: 13, color: COLORS.gray[400], fontWeight: '600', textTransform: 'uppercase' },
  amount: { ...TYPOGRAPHY.h1, fontSize: 36, color: COLORS.gray[900], marginVertical: 12 },
  exchangeBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  exchangeNote: { fontSize: 11, color: '#F97316', fontWeight: '700' },
  content: { padding: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.h2, fontSize: 16, color: COLORS.gray[800], marginVertical: 20 },
  methodGroup: { 
    backgroundColor: COLORS.white, 
    padding: SPACING.md, 
    borderRadius: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  bankDetailCard: {
    padding: 16,
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.gray[300],
  },
  bankName: { fontSize: 16, fontWeight: '900', color: COLORS.gray[900], marginBottom: 8 },
  bankAccount: { fontSize: 20, fontWeight: '700', color: '#F97316', marginBottom: 4, letterSpacing: 1 },
  beneficiary: { fontSize: 12, color: COLORS.gray[600], marginBottom: 12 },
  copyText: { fontSize: 12, color: '#F97316', fontWeight: '800', textDecorationLine: 'underline' },
  uploadArea: {
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: { fontSize: 14, fontWeight: '700', color: COLORS.gray[400] },
  noticeCard: { 
    backgroundColor: '#FFF7ED', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#FFEDD5',
    marginTop: 20
  },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  noticeTitle: { fontSize: 15, fontWeight: '800', color: '#9A3412' },
  noticeContent: { fontSize: 13, lineHeight: 20, color: '#C2410C', fontWeight: '500' },
  agreementRow: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: COLORS.gray[100],
    marginTop: 16,
    gap: 12,
    alignItems: 'center'
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 6, 
    borderWidth: 2, 
    borderColor: COLORS.gray[300], 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  checkInner: { width: 10, height: 10, backgroundColor: COLORS.white, borderRadius: 2 },
  agreementText: { flex: 1, fontSize: 12, color: COLORS.gray[600], fontWeight: '600' },
  payButton: { marginTop: 24, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  payText: { color: COLORS.white, fontWeight: '900', fontSize: 18 }
});

