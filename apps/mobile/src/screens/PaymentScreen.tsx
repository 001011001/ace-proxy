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
      Alert.alert('提示', '请先勾选跨境代购协议');
      return;
    }
    handleFinalConfirm();
  };

  const handleFinalConfirm = () => {
    // UI 架构师注：记录协议确认存证
    const auditData = {
      terms_accepted: true,
      deviceId: 'DEVICE_FINGERPRINT_HASH',
      timestamp: new Date().getTime()
    };
    console.log('[Compliance Audit] Evidence saved:', auditData);
    Alert.alert('支付成功', '您的订单已提交。温馨提示：代购商品不支持退货。');
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

          {/* ... method groups ... */}

          {/* 温和的服务卡片 (Service Agreement Notice) */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Text style={{ fontSize: 16 }}>💡</Text>
              <Text style={styles.noticeTitle}>跨境代购特别说明</Text>
            </View>
            <Text style={styles.noticeContent}>
              AceProxy 作为代购平台，仅根据您的指令从 1688 原厂采购。跨境商品<Text style={styles.highlightText}>一旦发出概不退货</Text>。若有售后需求，请在收货后使用 <Text style={styles.boldText}>Resale Hub</Text> 变现。
            </Text>
          </TouchableOpacity>

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
              { backgroundColor: agreementConfirmed ? '#F97316' : COLORS.gray[300] }, 
              agreementConfirmed && SHADOWS.medium
            ]}
            onPress={handlePayPress}
            disabled={!agreementConfirmed}
          >
            <Text style={styles.payText}>确认并支付</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
