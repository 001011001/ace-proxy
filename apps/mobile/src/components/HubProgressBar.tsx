import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolateColor
} from 'react-native-reanimated';
import { BORDERS, SHADOWS, SPACING } from '../theme';

interface HubProgressBarProps {
  hubName: string;
  current: number;
  target: number;
  unit?: string;
}

export const HubProgressBar = ({ hubName, current, target, unit = 'kg' }: HubProgressBarProps) => {
  const progress = Math.min(current / target, 1);
  const percentage = Math.round(progress * 100);
  const isUrgent = percentage >= 85;

  // 1. 紧急状态下的呼吸动画 (Blinking/Pulsing for urgency)
  const blinkOpacity = useSharedValue(1);
  
  useEffect(() => {
    if (isUrgent) {
      blinkOpacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      blinkOpacity.value = 1;
    }
  }, [isUrgent]);

  const animatedUrgentStyle = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
    backgroundColor: isUrgent ? '#F97316' : '#000'
  }));

  return (
    <Animated.View entering={FadeInDown.duration(800)} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hubLabel}>GLOBAL LOGISTICS PULSE</Text>
          <Text style={styles.hubName}>{hubName}</Text>
        </View>
        <Animated.View style={[styles.badge, isUrgent && styles.urgentBadge, animatedUrgentStyle]}>
          <Text style={styles.badgeText}>{isUrgent ? '🚀 CEPAT' : '📦 KUMPUL'}</Text>
        </Animated.View>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { width: `${percentage}%` }, 
            isUrgent && styles.urgentBar,
            isUrgent && { opacity: blinkOpacity }
          ]} 
        />
        <Text style={[styles.percentageText, percentage > 50 ? styles.whiteText : styles.blackText]}>
          {percentage}%
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.statsText}>
          Terkumpul: <Text style={styles.bold}>{current}{unit}</Text> / {target}{unit}
        </Text>
        <Text style={[styles.etaText, isUrgent && { color: '#DC2626' }]}>
          {isUrgent ? 'Kirim Hari Ini!' : `Estimasi: ${Math.max(1, 4 - Math.floor(progress * 4))} hari lagi`}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 24,
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hubLabel: { fontSize: 10, fontWeight: '900', color: '#64748B', letterSpacing: 1 },
  hubName: { fontSize: 20, fontWeight: '900', color: '#000', textTransform: 'uppercase', marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...BORDERS.brutalist,
  },
  urgentBadge: { borderColor: '#000' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  progressContainer: {
    height: 40,
    backgroundColor: '#F1F5F9',
    ...BORDERS.brutalist,
    overflow: 'hidden',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000',
    borderRightWidth: 4,
    borderColor: '#000',
  },
  urgentBar: { backgroundColor: '#F97316' },
  percentageText: {
    position: 'absolute',
    left: 15, // Change to left for better visibility and consistent starting point
    fontSize: 18,
    fontWeight: '900',
    zIndex: 1,
  },
  whiteText: { color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
  blackText: { color: '#000' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: { fontSize: 13, color: '#000', fontWeight: '600' },
  bold: { fontWeight: '900' },
  etaText: { fontSize: 11, fontWeight: '900', color: '#64748B', textTransform: 'uppercase' },
});
