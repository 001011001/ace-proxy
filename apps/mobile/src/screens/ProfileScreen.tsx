import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS, SHADOWS } from '../theme';
import { useRole } from '../context/RoleContext';

export const ProfileScreen = () => {
  const { role, currentTheme: theme } = useRole();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>A</Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Text style={{ fontSize: 12 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Ahmad Suherman</Text>
          <Text style={styles.userPhone}>+62 812-3456-7890</Text>
          
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>⭐ ACE GOLD PARTNER</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Pengaturan Akun (Settings)</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📍</Text>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuLabel}>Alamat Pengiriman</Text>
              <Text style={styles.menuSub}>Kelola alamat Jakarta & sekitarnya</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📦</Text>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuLabel}>Pesanan Saya</Text>
              <Text style={styles.menuSub}>Cek status "Cluster Logistics"</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📜</Text>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuLabel}>Riwayat Transaksi</Text>
              <Text style={styles.menuSub}>Bukti transfer & Verifikasi</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🛡️</Text>
            <View style={styles.menuTextContent}>
              <Text style={styles.menuLabel}>Keamanan & Privasi</Text>
              <Text style={styles.menuSub}>Enkripsi data & WhatsApp link</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { marginTop: 40, borderColor: '#DC2626' }]}>
            <Text style={styles.menuIcon}>🚪</Text>
            <View style={styles.menuTextContent}>
              <Text style={[styles.menuLabel, { color: '#DC2626' }]}>Keluar (Logout)</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { 
    backgroundColor: '#fff', 
    padding: 40, 
    alignItems: 'center', 
    borderBottomWidth: 4, 
    borderColor: '#000',
    marginBottom: 20
  },
  avatarContainer: { marginBottom: 20 },
  avatarPlaceholder: { 
    width: 100, 
    height: 100, 
    backgroundColor: '#F97316', 
    ...BORDERS.card, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarInitial: { fontSize: 48, fontWeight: '900', color: '#fff' },
  editBadge: { 
    position: 'absolute', 
    bottom: -5, 
    right: -5, 
    backgroundColor: '#fff', 
    width: 32, 
    height: 32, 
    ...BORDERS.card, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  userName: { fontSize: 22, fontWeight: '900', color: '#000' },
  userPhone: { fontSize: 14, fontWeight: '700', color: COLORS.gray[400], marginTop: 4 },
  tierBadge: { 
    marginTop: 16, 
    backgroundColor: '#000', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    ...BORDERS.card 
  },
  tierText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  content: { padding: SPACING.md },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: COLORS.gray[400], marginBottom: 16, textTransform: 'uppercase' },
  menuItem: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    padding: 20, 
    ...BORDERS.card, 
    alignItems: 'center', 
    marginBottom: 12 
  },
  menuIcon: { fontSize: 24, marginRight: 16 },
  menuTextContent: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '900', color: '#000' },
  menuSub: { fontSize: 12, fontWeight: '600', color: COLORS.gray[400], marginTop: 2 },
  arrow: { fontSize: 20, fontWeight: '900', color: '#000' }
});

