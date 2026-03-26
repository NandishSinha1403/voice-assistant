import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createTicket } from '../api/client';
import { colors } from '../theme';

export function CreateTicketScreen({ navigation, user }) {
  const [name, setName] = useState('');
  const [complaint, setComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const nameValid = name.trim().length >= 1;
  const complaintValid = complaint.trim().length >= 10;
  const canSubmit = nameValid && complaintValid && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      const data = await createTicket(name.trim(), complaint.trim());
      setResult(data);
    } catch (err) {
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Failed to create ticket');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Success view
  if (result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Complaint Registered!</Text>
          <Text style={styles.successSub}>Your complaint has been filed successfully.</Text>

          <View style={styles.ticketIdBox}>
            <Text style={styles.ticketIdLabel}>Ticket ID</Text>
            <Text style={styles.ticketIdValue}>{result.ticket.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Open</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{result.ticket.phone}</Text>
          </View>

          {result.uploadUrl && (
            <Pressable
              style={styles.uploadBtn}
              onPress={() => Linking.openURL(result.uploadUrl)}
            >
              <Text style={styles.uploadBtnText}>📎 Upload Documents</Text>
            </Pressable>
          )}

          <Text style={styles.uploadHint}>
            Upload link valid for 48 hours. SMS also sent to your phone.
          </Text>

          <Pressable
            style={styles.viewBtn}
            onPress={() => {
              navigation.replace('TicketDetail', { ticket: result.ticket });
            }}
          >
            <Text style={styles.viewBtnText}>View Ticket Details</Text>
          </Pressable>

          <Pressable
            style={styles.homeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.homeBtnText}>← Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // Form view
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Phone info */}
        <View style={styles.phoneCard}>
          <Text style={styles.phoneLabel}>Filing as</Text>
          <Text style={styles.phoneValue}>{user?.id || 'Unknown'}</Text>
        </View>

        {/* Name input */}
        <Text style={styles.label}>Your Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor={colors.textDim}
          maxLength={100}
          autoCapitalize="words"
        />

        {/* Complaint input */}
        <Text style={styles.label}>Complaint Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={complaint}
          onChangeText={setComplaint}
          placeholder="Describe your complaint in detail (minimum 10 characters)..."
          placeholderTextColor={colors.textDim}
          maxLength={2000}
          multiline
          textAlignVertical="top"
          numberOfLines={6}
        />
        <Text style={styles.charCount}>
          {complaint.length} / 2000
          {complaint.length > 0 && complaint.trim().length < 10 && (
            <Text style={styles.charWarn}> — minimum 10 characters</Text>
          )}
        </Text>

        {/* Error */}
        {error !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Submit */}
        <Pressable
          style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Submitting…' : '📝 Submit Complaint'}
          </Text>
        </Pressable>

        <Text style={styles.footerNote}>
          After submission, you'll receive a ticket ID and a link to upload supporting documents (photos, PDFs).
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },

  // Phone card
  phoneCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneLabel: { fontSize: 13, color: colors.textDim, fontWeight: '500' },
  phoneValue: { fontSize: 15, color: colors.blue3, fontWeight: '700' },

  // Form
  label: {
    fontSize: 13, color: colors.textSecondary, fontWeight: '600',
    marginBottom: 6, marginTop: 4, letterSpacing: 0.3,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 4,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  charCount: { fontSize: 12, color: colors.textDim, textAlign: 'right', marginBottom: 16 },
  charWarn: { color: colors.amber },

  // Error
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { color: colors.red, fontSize: 14 },

  // Submit
  submitBtn: {
    backgroundColor: colors.blue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  footerNote: {
    fontSize: 12, color: colors.textDim, textAlign: 'center',
    lineHeight: 18, paddingHorizontal: 16,
  },

  // Success view
  successCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 6 },
  successSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },

  ticketIdBox: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.25)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  ticketIdLabel: { fontSize: 11, color: colors.textDim, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  ticketIdValue: { fontSize: 20, fontWeight: '800', color: colors.blue3 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', paddingVertical: 8,
    borderBottomColor: colors.border, borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 13, color: colors.textDim },
  infoValue: { fontSize: 14, color: colors.text, fontWeight: '500' },

  statusPill: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderColor: 'rgba(37,99,235,0.25)',
    borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 3, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.blue3 },

  uploadBtn: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.25)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  uploadBtnText: { fontSize: 15, fontWeight: '700', color: colors.blue3 },
  uploadHint: { fontSize: 12, color: colors.textDim, textAlign: 'center', marginTop: 8, marginBottom: 16 },

  viewBtn: {
    backgroundColor: colors.blue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  viewBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  homeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
