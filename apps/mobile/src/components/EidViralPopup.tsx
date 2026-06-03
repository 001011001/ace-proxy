import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  Image 
} from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { COLORS, SPACING, BORDERS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');

/**
 * EidViralPopup - 开斋节大促裂变弹窗
 * Encourages users to invite neighbors to waive service fees.
 */
export const EidViralPopup = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={ZoomIn.duration(400)}
          style={[styles.modalBox, SHADOWS.brutalist]}
        >
          {/* Header Image/Icon */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={{fontSize: 50}}>🕌</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.tag}>LEBARAN 2026 SPECIAL</Text>
            <Text style={styles.title}>Unlock Free Sourcing Fee!</Text>
            <Text style={styles.desc}>
              Invite 3 neighbors to join AceProxy Jakarta and waive your 
              "Steward Service Fee" for your entire Lebaran 2026 order.
            </Text>

            {/* Progress Visualization */}
            <View style={styles.progressContainer}>
              <View style={styles.dotsRow}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dotLine} />
                <View style={styles.dot} />
                <View style={styles.dotLine} />
                <View style={styles.dot} />
              </View>
              <Text style={styles.progressLabel}>1 / 3 Neighbors Invited</Text>
            </View>

            <TouchableOpacity style={[styles.mainBtn, SHADOWS.soft]} onPress={onClose}>
              <Text style={styles.btnText}>INVITE ON WHATSAPP</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
              <Text style={styles.skipText}>LATER, COMMANDER</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#064E3B', // Forest Green
    padding: 32,
    borderWidth: 6,
    borderColor: '#F59E0B', // Gold
    alignItems: 'center'
  },
  header: {
    marginTop: -80,
    backgroundColor: '#064E3B',
    padding: 20,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: '#F59E0B',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    alignItems: 'center',
    marginTop: 24
  },
  tag: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16
  },
  desc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '700',
    marginBottom: 32
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#F59E0B',
    backgroundColor: 'transparent'
  },
  dotActive: {
    backgroundColor: '#F59E0B'
  },
  dotLine: {
    width: 40,
    height: 3,
    backgroundColor: '#F59E0B',
    marginHorizontal: 4
  },
  progressLabel: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '900'
  },
  mainBtn: {
    backgroundColor: '#F59E0B',
    width: '100%',
    padding: 20,
    alignItems: 'center',
    ...BORDERS.brutalist,
    shadowColor: '#000'
  },
  btnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900'
  },
  skipBtn: {
    marginTop: 20
  },
  skipText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '800',
    textDecorationLine: 'underline'
  }
});
