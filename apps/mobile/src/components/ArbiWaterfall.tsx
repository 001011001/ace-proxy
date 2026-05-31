import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

const MOCK_DATA = [
  { id: '1', item: 'Muslim Dress (Raya Edition)', margin: '+210%', price: '￥150', profit: '+$55', tag: 'Hot' },
  { id: '2', item: 'Vacuum Sealer Pro', margin: '+245%', price: '￥89', profit: '+$32', tag: 'New' },
  { id: '3', item: 'LED Festive String Lights', margin: '+380%', price: '￥12', profit: '+$18', tag: 'Ramadan' },
  { id: '4', item: 'Smart Watch Ultra', margin: '+115%', price: '￥450', profit: '+$65', tag: 'Tech' },
];

export const ArbiWaterfall = () => {
  const { currentTheme: theme, t } = useRole();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.primary }]}>{t.profitFlow}</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: theme.primary }]}>View All →</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.soft]}>
            <View style={[styles.tagBadge, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.tagText, { color: theme.primary }]}>{item.tag}</Text>
            </View>
            <Text style={styles.itemText} numberOfLines={1}>{item.item}</Text>
            <View style={styles.row}>
              <Text style={styles.marginText}>{item.margin}</Text>
              <Text style={styles.profitText}>{item.profit}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.priceText}>Cost: {item.price}</Text>
              <View style={styles.arbiIndicator}>
                <Text style={styles.arbiIcon}>⚡</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 20,
    marginRight: SPACING.sm,
    width: 170,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  itemText: {
    ...TYPOGRAPHY.body,
    fontWeight: '800',
    fontSize: 14,
    color: COLORS.gray[800],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  marginText: {
    color: '#16A34A',
    fontWeight: '900',
    fontSize: 18,
  },
  profitText: {
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    color: COLORS.gray[400],
    fontSize: 11,
    fontWeight: '500',
  },
  arbiIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arbiIcon: {
    fontSize: 10,
  }
});
