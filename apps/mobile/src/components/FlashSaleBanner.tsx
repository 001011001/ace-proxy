import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SHADOWS, SPACING } from '../theme';

export const FlashSaleBanner = () => {
  const [seconds, setSeconds] = useState(3600);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity style={[styles.container, SHADOWS.md]}>
      <View style={styles.left}>
        <Text style={styles.badge}>FLASH SALE</Text>
        <Text style={styles.title}>Ramadan Deals</Text>
        <Text style={styles.subtitle}>Up to 80% Off 利差补贴</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.timeLabel}>Ends in</Text>
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
    backgroundColor: '#FF4D4F', 
    borderRadius: 24, 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    overflow: 'hidden'
  },
  left: { flex: 1 },
  badge: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    color: '#fff', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    fontSize: 10, 
    fontWeight: '900',
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  right: { alignItems: 'flex-end' },
  timeLabel: { color: '#fff', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  timer: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  timeText: { color: '#FF4D4F', fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'] }
});
