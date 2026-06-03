import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SHADOWS, SPACING, BORDERS } from '../theme';

export const FlashSaleBanner = ({ festival, onPress }: { festival?: any, onPress?: () => void }) => {
  const [seconds, setSeconds] = useState(3600);
  const theme = festival || { primary: '#FF4D4F', bannerText: 'Global Deals' };

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.container, 
        SHADOWS.brutalist,
        { backgroundColor: theme.primary }
      ]}
    >
      <View style={styles.left}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badge}>EXCLUSIVE ACCESS</Text>
        </View>
        <Text style={styles.title}>{theme.bannerText}</Text>
        <Text style={styles.subtitle}>Curated Manufacturing Direct</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.timeLabel}>Reservation Ends In</Text>
        <View style={styles.timer}>
          <Text style={styles.timeText}>{formatTime(seconds)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    margin: SPACING.lg, 
    borderRadius: 0, // More brutalist
    padding: 24, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    overflow: 'hidden',
    ...BORDERS.brutalist,
  },
  left: { flex: 1 },
  badgeContainer: { flexDirection: 'row', marginBottom: 12 },
  badge: { 
    backgroundColor: '#000', 
    color: '#fff', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    fontSize: 10, 
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: { color: '#000', fontSize: 22, fontWeight: '900', textTransform: 'uppercase', letterSpacing: -1 },
  subtitle: { color: 'rgba(0,0,0,0.7)', fontSize: 12, fontWeight: '800', marginTop: 4, textTransform: 'uppercase' },
  right: { alignItems: 'flex-end' },
  timeLabel: { color: '#000', fontSize: 10, fontWeight: '900', marginBottom: 8, textTransform: 'uppercase', opacity: 0.6 },
  timer: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, ...BORDERS.brutalist },
  timeText: { color: '#000', fontSize: 18, fontWeight: '900', fontVariant: ['tabular-nums'] }
});
