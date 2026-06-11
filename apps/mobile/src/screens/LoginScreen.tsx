import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDERS } from '../theme';
import { api } from '../services/APIService';

export const LoginScreen = ({ onLogin }: { onLogin: (token: string, user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const result = isRegister
        ? await api.register(email, password)
        : await api.login(email, password);

      await api.setToken(result.accessToken);
      onLogin(result.accessToken, result.user);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'PLEASE WAIT...' : isRegister ? 'CREATE ACCOUNT' : 'LOGIN & START'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setIsRegister(!isRegister)}
          >
            <Text style={styles.secondaryBtnText}>
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </Text>
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
    textTransform: 'uppercase',
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
    fontWeight: '700',
    color: '#64748B',
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '700',
  },
});
