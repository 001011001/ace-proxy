import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDERS } from '../theme';

export const LoginScreen = ({ onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>ACEPROXY</Text>
          <Text style={styles.subtitle}>GLOBAL SOURCING STEWARD</Text>
        </View>

        <View style={styles.form}>
          {!isCodeSent ? (
            <>
              <Text style={styles.label}>WHATSAPP NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="+62 812..."
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setIsCodeSent(true)}
              >
                <Text style={styles.primaryBtnText}>SEND VERIFICATION CODE</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>ENTER VERIFICATION CODE</Text>
              <TextInput
                style={styles.input}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={onLogin}
              >
                <Text style={styles.primaryBtnText}>LOGIN & START SOURCING</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setIsCodeSent(false)}
              >
                <Text style={styles.secondaryBtnText}>BACK TO PHONE</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.dividerBox}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR LOGIN WITH</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialGrid}>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>F</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          By logging in, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: '#FFF',
    padding: SPACING.xl,
    borderRadius: 4,
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F97316',
    letterSpacing: 2,
    marginTop: -4,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '700',
    ...BORDERS.brutalist,
    borderWidth: 2,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
    shadowOffset: { width: 4, height: 4 },
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  dividerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 2,
    backgroundColor: '#000',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 10,
    fontWeight: '900',
    color: '#000',
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: SPACING.lg,
  },
  socialBtn: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...BORDERS.brutalist,
    ...SHADOWS.brutalist,
    shadowOffset: { width: 4, height: 4 },
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: '900',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '700',
  },
});
