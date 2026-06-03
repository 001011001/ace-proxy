import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRole } from '../context/RoleContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDERS } from '../theme';

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
        <Text style={[styles.title, { color: COLORS.black }]}>{t.profitFlow}</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, { color: COLORS.gray[500] }]}>View All →</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_DATA}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.brutalist]}>
            <View style={[styles.tagBadge, { backgroundColor: COLORS.black }]}>
              <Text style={[styles.tagText, { color: COLORS.white }]}>{item.tag}</Text>
            </View>
            <Text style={styles.itemText} numberOfLines={1}>{item.item}</Text>
            <View style={styles.row}>
              <Text style={styles.marginText}>{item.margin}</Text>
              <Text style={styles.profitText}>{item.profit}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.priceText}>Cost: {item.price}</Text>
              <View style={styles.selectionIndicator}>
                <Text style={styles.selectionIcon}>⚡</Text>
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
    textTransform: 'uppercase',
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginRight: SPACING.md,
    width: 180,
    ...BORDERS.brutalist,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  itemText: {
    ...TYPOGRAPHY.body,
    fontWeight: '900',
    fontSize: 14,
    color: COLORS.gray[900],
    textTransform: 'uppercase',
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
    fontSize: 20,
  },
  profitText: {
    backgroundColor: '#F0FDF4',
    color: '#16A34A',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '900',
    ...BORDERS.brutalist,
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    color: COLORS.gray[500],
    fontSize: 11,
    fontWeight: '800',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    ...BORDERS.brutalist,
    borderWidth: 1.5,
  },
  selectionIcon: {
    fontSize: 12,
  }
});
