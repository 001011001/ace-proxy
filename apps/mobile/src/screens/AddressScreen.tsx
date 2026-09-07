import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS, SHADOWS } from '../theme';

// Mock data for Indonesian addresses
const PROVINCES = ['DKI Jakarta', 'Jawa Barat', 'Banten'];
const CITIES: Record<string, string[]> = {
  'DKI Jakarta': ['Jakarta Utara', 'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur'],
  'Jawa Barat': ['Kota Bandung', 'Kota Bogor', 'Kota Bekasi'],
  'Banten': ['Kota Tangerang', 'Tangerang Selatan'],
};

export const AddressScreen = () => {
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!province || !city || !district || !village || !details || !phone || !name) {
      Alert.alert('Error', 'Harap isi semua kolom alamat.');
      return;
    }
    Alert.alert('Sukses', 'Alamat pengiriman telah disimpan.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alamat Pengiriman</Text>
        <Text style={styles.headerSub}>Shipping Address (Indo Only)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Nama Penerima (Receiver Name)</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName} 
            placeholder="e.g. Ahmad Suherman"
          />

          <Text style={styles.inputLabel}>Nomor WhatsApp (Phone)</Text>
          <TextInput 
            style={styles.input} 
            value={phone} 
            onChangeText={setPhone} 
            placeholder="+62 812..."
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Provinsi (Province)</Text>
          <View style={styles.pickerPlaceholder}>
            <Text style={province ? styles.pickerText : styles.pickerHint}>
              {province || 'Pilih Provinsi'}
            </Text>
          </View>

          <Text style={styles.inputLabel}>Kota / Kabupaten (City)</Text>
          <View style={styles.pickerPlaceholder}>
            <Text style={city ? styles.pickerText : styles.pickerHint}>
              {city || 'Pilih Kota'}
            </Text>
          </View>

          <Text style={styles.inputLabel}>Kecamatan (District)</Text>
          <TextInput 
            style={styles.input} 
            value={district} 
            onChangeText={setDistrict} 
            placeholder="e.g. Penjaringan"
          />

          <Text style={styles.inputLabel}>Kelurahan (Village)</Text>
          <TextInput 
            style={styles.input} 
            value={village} 
            onChangeText={setVillage} 
            placeholder="e.g. Pluit"
          />

          <Text style={styles.inputLabel}>Alamat Lengkap (Full Details)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={details} 
            onChangeText={setDetails} 
            placeholder="Nama Jalan, No. Rumah, RT/RW..."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>SIMPAN ALAMAT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { padding: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 4, borderColor: '#000' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#000' },
  headerSub: { fontSize: 12, fontWeight: '700', color: COLORS.gray[400], textTransform: 'uppercase' },
  scrollContent: { padding: SPACING.md },
  card: { backgroundColor: COLORS.white, padding: SPACING.md, ...BORDERS.card, ...SHADOWS.card, marginBottom: 40 },
  inputLabel: { fontSize: 11, fontWeight: '900', color: '#000', marginBottom: 6, textTransform: 'uppercase' },
  input: { 
    height: 50, 
    borderWidth: 2, 
    borderColor: '#000', 
    paddingHorizontal: 15, 
    fontSize: 14, 
    fontWeight: '700', 
    backgroundColor: '#fff', 
    marginBottom: 16 
  },
  textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  pickerPlaceholder: { 
    height: 50, 
    borderWidth: 2, 
    borderColor: '#000', 
    justifyContent: 'center', 
    paddingHorizontal: 15, 
    backgroundColor: COLORS.gray[50], 
    marginBottom: 16 
  },
  pickerText: { fontSize: 14, fontWeight: '700', color: '#000' },
  pickerHint: { fontSize: 14, fontWeight: '600', color: COLORS.gray[300] },
  saveBtn: { 
    backgroundColor: '#F97316', 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...BORDERS.card, 
    ...SHADOWS.card 
  },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' }
});

