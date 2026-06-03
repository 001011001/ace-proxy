import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../theme';

export const HonestQCReportScreen = ({ route, navigation }) => {
  const mockReport = {
    orderId: 'ORD-1002',
    productName: 'Silk Hijab Emerald',
    status: 'Slight Defect',
    aiConfidence: 94,
    colorDelta: 6.8,
    colorThreshold: 5.0,
    issue: 'Minor Color Variation',
    description: 'AI detected a 7% variation from the official reference. This is likely due to factory batch differences.',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Honest QC Report</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusBanner, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: '#991B1B' }]}>AI Status: {mockReport.status}</Text>
        </View>

        <View style={styles.imageComparison}>
          <View style={styles.imageBox}>
            <View style={styles.placeholderImg}><Text style={{fontSize:40}}>🖼️</Text></View>
            <Text style={styles.imageLabel}>Official Ref</Text>
          </View>
          <View style={styles.imageBox}>
            <View style={[styles.placeholderImg, styles.defectHighlight]}><Text style={{fontSize:40}}>📸</Text></View>
            <Text style={styles.imageLabel}>Real Snapshot</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Audit Details</Text>
          <View style={[styles.card, SHADOWS.soft]}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Color Delta (ΔE)</Text>
              <Text style={[styles.dataVal, { color: '#EF4444' }]}>{mockReport.colorDelta} / 5.0</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '85%', backgroundColor: '#EF4444' }]} />
            </View>
            <Text style={styles.issueDesc}>{mockReport.description}</Text>
          </View>
        </View>

        <View style={styles.salvageSection}>
          <Text style={styles.salvageTitle}>AceProxy "Quality Care" Options</Text>
          <Text style={styles.salvageSub}>Choose how you want to proceed:</Text>

          <TouchableOpacity style={[styles.optionCard, { borderColor: '#DB2777' }]}>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Accept & Quality Shield</Text>
              <View style={styles.rebateBadge}><Text style={styles.rebateText}>+15% Credits</Text></View>
            </View>
            <Text style={styles.optionDesc}>Keep the item. Receive 15% service fee rebate in Ace Credits instantly via our Quality Shield program.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionCard, { borderColor: '#8B5CF6' }]}>
            <Text style={styles.optionTitle}>Transfer to Outlet Hub</Text>
            <Text style={styles.optionDesc}>Automatically list this item in the local Outlet Hub at a 20% discount for immediate clearance.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionCard, { borderColor: '#94A3B8' }]}>
            <Text style={styles.optionTitle}>Request Full Return</Text>
            <Text style={styles.optionDesc}>Return to Manufacturing Center. Note: This may take 7-10 business days.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF' },
  backBtn: { fontSize: 24, marginRight: 16, fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  content: { padding: 20 },
  statusBanner: { padding: 12, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  statusText: { fontWeight: '800', fontSize: 13, textTransform: 'uppercase' },
  imageComparison: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  imageBox: { flex: 1, alignItems: 'center' },
  placeholderImg: { width: '100%', height: 160, backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  defectHighlight: { borderColor: '#EF4444', borderWidth: 2 },
  imageLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#1E293B', marginBottom: 12 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dataLabel: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  dataVal: { fontSize: 13, fontWeight: '900' },
  progressBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginBottom: 16 },
  progressFill: { height: '100%', borderRadius: 3 },
  issueDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  salvageSection: { paddingBottom: 40 },
  salvageTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  salvageSub: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 20, fontWeight: '600' },
  optionCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 12, borderWidth: 2, borderStyle: 'dashed' },
  optionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  optionTitle: { fontSize: 14, fontWeight: '900', color: '#1E293B' },
  optionDesc: { fontSize: 12, color: '#64748B', lineHeight: 18 },
  rebateBadge: { backgroundColor: '#DB2777', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  rebateText: { color: '#FFF', fontSize: 10, fontWeight: '900' }
});
