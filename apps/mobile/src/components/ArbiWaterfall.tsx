import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';

const MOCK_DATA = [
  { id: '1', item: 'Nike Air Max', margin: '+156%', price: '￥299', profit: '+$45' },
  { id: '2', item: 'Vacuum Sealer', margin: '+210%', price: '￥89', profit: '+$22' },
  { id: '3', item: 'Muslim Dress', margin: '+180%', price: '￥150', profit: '+$38' },
  { id: '4', item: 'Smart Watch', margin: '+120%', price: '￥450', profit: '+$60' },
];

export const ArbiWaterfall = () => {
  const { currentTheme: theme, t } = useRole();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.primary }]}>{t.profitFlow}</Text>
      <FlatList
        data={MOCK_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.soft]}>
            <Text style={styles.itemText}>{item.item}</Text>
            <View style={styles.row}>
              <Text style={styles.marginText}>{item.margin}</Text>
              <Text style={styles.profitText}>{item.profit}</Text>
            </View>
            <Text style={styles.priceText}>进货价: {item.price}</Text>
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
  title: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginRight: SPACING.sm,
    width: 160,
  },
  itemText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  marginText: {
    color: COLORS.success,
    fontWeight: 'bold',
    fontSize: 16,
  },
  profitText: {
    backgroundColor: '#ECFDF5',
    color: COLORS.success,
    fontSize: 10,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  priceText: {
    color: COLORS.gray[500],
    fontSize: 12,
  },
});
