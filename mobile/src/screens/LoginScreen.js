import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { sendOtp, verifyOtp } from '../api/client';
import { colors } from '../theme';

export function LoginScreen({ onLogin }) {
  const [step, setStep] = useState(1); // 1 = phone, 2 = otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSendOtp() {
    const cleaned = phone.trim();
    if (!cleaned || cleaned.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOtp(cleaned, 'citizen');
      setSuccess(`OTP sent to ${cleaned}`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (otp.trim().length < 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await verifyOtp(phone.trim(), otp.trim(), 'citizen');
      onLogin(data);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🏛️</Text>
          </View>
          <Text style={styles.title}>Delhi Municipal Corporation</Text>
          <Text style={styles.subtitle}>Sign in to track your complaints</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Accent bar */}
          <View style={styles.accentBar} />

          {error ? (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{error}</Text>
            </View>
          ) : null}

          {success && step === 2 ? (
            <View style={styles.alertSuccess}>
              <Text style={styles.alertSuccessText}>{success}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View>
              <Text style={styles.label}>Registered mobile number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="9876543210"
                placeholderTextColor={colors.textDim}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
                autoFocus
              />
              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <View>
              <Pressable onPress={() => { setStep(1); setError(''); setOtp(''); }} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Back</Text>
              </Pressable>

              <Text style={styles.label}>Enter OTP sent to {phone}</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={setOtp}
                placeholder="------"
                placeholderTextColor={colors.textDim}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
                autoFocus
              />
              <Text style={styles.otpHint}>OTP is valid for 5 minutes</Text>
              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.footer}>Need help? Call 011-23456789</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    // Gradient approximation
    backgroundColor: colors.blue,
  },
  logoEmoji: { fontSize: 30 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 28,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    backgroundColor: colors.blue,
  },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  otpInput: {
    letterSpacing: 10,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpHint: { fontSize: 12, color: colors.textDim, textAlign: 'center', marginBottom: 16 },
  button: {
    backgroundColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backBtn: { marginBottom: 16 },
  backBtnText: { color: colors.textSecondary, fontSize: 14 },
  alertError: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  alertErrorText: { color: '#f87171', fontSize: 13 },
  alertSuccess: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderColor: 'rgba(34,197,94,0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  alertSuccessText: { color: colors.green, fontSize: 13 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 12, color: colors.textDim },
});
