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
 * PaymentScreen - Xendit 支付收银台 (工业级重塑版)
 * 支持 Bank Transfer, E-Wallet (OVO, DANA, Gopay) 等本地支付方式。
 * 包含强制性的“跨境代购协议”确认。
 */
export const PaymentScreen = ({ orderTotal = '2,450,000' }) => {
  const { currentTheme: theme } = useRole();
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer;
    if (showComplianceModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showComplianceModal, countdown]);

  const handlePayPress = () => {
    if (!agreementConfirmed) {
      Alert.alert('提示', '请先阅读并同意跨境代购协议');
      return;
    }
    setCountdown(3);
    setShowComplianceModal(true);
  };

  const handleFinalConfirm = () => {
    setShowComplianceModal(false);
    Alert.alert('支付成功', '您的跨境代购订单已提交，正在记录 Vault 复式账本。');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.summary}>
          <Text style={styles.label}>应付金额 (IDR)</Text>
          <Text style={styles.amount}>Rp {orderTotal}</Text>
          <View style={styles.exchangeBadge}>
            <Text style={styles.exchangeNote}>≈ ¥ 1,108.60 RMB (含 5% FX Buffer)</Text>
          </View>
        </Animated.View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>选择本地支付方式 (Xendit Gateway)</Text>

          {/* Virtual Account */}
          <View style={[styles.methodGroup, SHADOWS.soft]}>
            <Text style={styles.groupLabel}>Bank Transfer (Virtual Account)</Text>
            <PaymentMethod name="Mandiri VA" />
            <PaymentMethod name="BCA VA" />
            <PaymentMethod name="BNI VA" last />
          </View>

          {/* E-Wallet */}
          <View style={[styles.methodGroup, SHADOWS.soft]}>
            <Text style={styles.groupLabel}>E-Wallet (Local Mobile Pay)</Text>
            <View style={styles.walletRow}>
              <WalletButton name="Gopay" />
              <WalletButton name="OVO" />
              <WalletButton name="DANA" />
            </View>
          </View>

          {/* Agreement Checkbox - First Lock */}
          <TouchableOpacity 
            style={styles.agreementRow} 
            onPress={() => setAgreementConfirmed(!agreementConfirmed)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox, 
              agreementConfirmed && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}>
              {agreementConfirmed && <View style={styles.checkInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.agreementTitle}>Agreement Statement / Pernyataan Kesepakatan</Text>
              <Text style={styles.agreementText}>
                I agree that items purchased are <Text style={styles.boldText}>NON-RETURNABLE</Text>. If unsatisfied, I will use <Text style={{ color: theme.primary, fontWeight: '700' }}>Resale Hub</Text>.
                {"\n"}Saya menyetujui bahwa barang <Text style={styles.boldText}>TIDAK DAPAT DIKEMBALIKAN</Text>.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.payButton, 
              { backgroundColor: agreementConfirmed ? theme.primary : COLORS.gray[300] }, 
              agreementConfirmed && SHADOWS.medium
            ]}
            onPress={handlePayPress}
            disabled={!agreementConfirmed}
          >
            <Text style={styles.payText}>确认并支付</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Compliance Modal - Second Lock (Final Sale Confirmation) */}
      <Modal visible={showComplianceModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ FINAL SALE CONFIRMATION</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>English:</Text>{"\n"}
                I understand that AceProxy is an international proxy service. Per my purchase instructions, items are shipped directly from China. I agree that items purchased are <Text style={styles.highlight}>NON-RETURNABLE and NON-EXCHANGEABLE</Text>. If I am unsatisfied, I will use the 'Resale Hub' feature to resell the item.
                {"\n\n"}
                <Text style={styles.boldText}>Bahasa Indonesia:</Text>{"\n"}
                Saya memahami bahwa AceProxy adalah layanan jasa titip internasional. Saya menyetujui bahwa barang yang sudah dibeli <Text style={styles.highlight}>TIDAK DAPAT DIKEMBALIKAN ATAU DITUKAR</Text>. Jika saya tidak puas, saya akan menggunakan fitur 'Resale Hub'.
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={[
                styles.modalBtn, 
                { backgroundColor: countdown > 0 ? COLORS.gray[800] : '#000' }
              ]}
              disabled={countdown > 0}
              onPress={handleFinalConfirm}
            >
              <Text style={styles.modalBtnText}>
                {countdown > 0 ? `I UNDERSTAND (${countdown}s)` : 'CONFIRM & PAY NOW'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const PaymentMethod = ({ name, last }: any) => (
  <TouchableOpacity style={[styles.method, last && { borderBottomWidth: 0 }]}>
    <View style={styles.methodCircle} />
    <Text style={styles.methodName}>{name}</Text>
  </TouchableOpacity>
);

const WalletButton = ({ name }: any) => (
  <TouchableOpacity style={styles.walletBtn}>
    <View style={styles.walletIconPlaceholder} />
    <Text style={styles.walletText}>{name}</Text>
  </TouchableOpacity>
);

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
  groupLabel: { fontSize: 11, color: COLORS.gray[400], fontWeight: '700', marginBottom: 16, textTransform: 'uppercase' },
  method: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.gray[50] 
  },
  methodCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.gray[200], marginRight: 16 },
  methodName: { fontSize: 15, fontWeight: '600', color: COLORS.gray[800] },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  walletBtn: { 
    flex: 1, 
    paddingVertical: 16, 
    borderWidth: 1, 
    borderColor: COLORS.gray[100], 
    alignItems: 'center', 
    borderRadius: 16,
    backgroundColor: COLORS.gray[50]
  },
  walletIconPlaceholder: { width: 24, height: 24, backgroundColor: COLORS.gray[200], borderRadius: 6, marginBottom: 8 },
  walletText: { fontSize: 12, fontWeight: '700', color: COLORS.gray[600] },
  agreementRow: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: COLORS.white, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: COLORS.gray[100],
    marginTop: 20,
    gap: 12
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 6, 
    borderWidth: 2, 
    borderColor: COLORS.gray[300], 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 2
  },
  checkInner: { width: 10, height: 10, backgroundColor: COLORS.white, borderRadius: 2 },
  agreementTitle: { fontSize: 12, fontWeight: '800', color: COLORS.gray[800], marginBottom: 4 },
  agreementText: { fontSize: 10, color: COLORS.gray[500], lineHeight: 14, fontWeight: '500' },
  boldText: { fontWeight: '800', color: COLORS.gray[900] },
  payButton: { marginTop: 20, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  payText: { color: COLORS.white, fontWeight: '900', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 32, padding: 32, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.gray[900], marginBottom: 16 },
  modalText: { fontSize: 14, lineHeight: 22, color: COLORS.gray[600], marginBottom: 32 },
  highlight: { color: '#DC2626', fontWeight: '800' },
  modalBtn: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 16 }
});
