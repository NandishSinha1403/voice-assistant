import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { API_BASE_URL } from '../config';
import { colors } from '../theme';

function StatusPill({ status }) {
  const s = (status || 'open').replace(' ', '-');
  const map = {
    'open': { bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.25)', color: colors.blue3 },
    'in-progress': { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', color: '#c084fc' },
    'resolved': { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', color: colors.green },
  };
  const style = map[s] || map['open'];

  return (
    <View style={[styles.pill, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.pillText, { color: style.color }]}>{status || 'open'}</Text>
    </View>
  );
}

export function TicketDetailScreen({ route }) {
  const { ticket } = route.params;
  const date = new Date(ticket.createdAt).toLocaleString('en-IN');
  const hasUpload = ticket.uploadToken && new Date(ticket.uploadExpiry) > new Date();
  const expiry = ticket.uploadExpiry ? new Date(ticket.uploadExpiry).toLocaleString('en-IN') : '';
  const files = ticket.files || [];
  const notes = ticket.notes || [];

  function openUpload() {
    const url = `${API_BASE_URL}/upload/${ticket.uploadToken}`;
    Linking.openURL(url);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Ticket Header Card */}
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.topRow}>
          <Text style={styles.ticketId}>{ticket.id}</Text>
          <StatusPill status={ticket.status} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{ticket.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{ticket.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Filed</Text>
          <Text style={styles.value}>{date}</Text>
        </View>
      </View>

      {/* Complaint */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complaint Description</Text>
        <View style={styles.complaintCard}>
          <Text style={styles.complaintText}>{ticket.complaint}</Text>
        </View>
      </View>

      {/* DMC Updates */}
      {notes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Updates from DMC</Text>
          {notes.map((n, i) => (
            <View key={i} style={styles.noteCard}>
              <Text style={styles.noteText}>{n.text}</Text>
              <Text style={styles.noteMeta}>— Admin · {new Date(n.at).toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Files */}
      {files.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uploaded Files ({files.length})</Text>
          {files.map((f, i) => (
            <View key={i} style={styles.fileRow}>
              <Text style={styles.fileIcon}>
                {f.mimeType?.startsWith('image/') ? '🖼️' : f.mimeType === 'application/pdf' ? '📕' : '📄'}
              </Text>
              <Text style={styles.fileName} numberOfLines={1}>{f.originalName}</Text>
              <Text style={styles.fileCheck}>✅</Text>
            </View>
          ))}
        </View>
      )}

      {/* Upload Documents */}
      {hasUpload && (
        <View style={styles.section}>
          <Pressable style={styles.uploadBtn} onPress={openUpload}>
            <Text style={styles.uploadBtnText}>📎 Upload Documents</Text>
          </Pressable>
          <Text style={styles.expiryText}>⏰ Upload link expires: {expiry}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    backgroundColor: colors.blue,
  },
  topRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, paddingBottom: 16, borderBottomColor: colors.border, borderBottomWidth: 1,
  },
  ticketId: { fontSize: 18, fontWeight: '800', color: colors.blue3 },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 70, fontSize: 13, color: colors.textDim, fontWeight: '500' },
  value: { flex: 1, fontSize: 14, color: colors.text },

  // Sections
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: colors.textDim, marginBottom: 10,
  },

  // Complaint
  complaintCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  complaintText: { fontSize: 14, color: colors.text, lineHeight: 22 },

  // Notes
  noteCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  noteText: { fontSize: 13, color: colors.text, lineHeight: 20, marginBottom: 6 },
  noteMeta: { fontSize: 11, color: colors.textDim },

  // Files
  fileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  fileIcon: { fontSize: 18 },
  fileName: { flex: 1, fontSize: 13, color: colors.text },
  fileCheck: { fontSize: 16 },

  // Upload
  uploadBtn: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.25)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  uploadBtnText: { fontSize: 15, fontWeight: '700', color: colors.blue3 },
  expiryText: { fontSize: 12, color: colors.amber, textAlign: 'center', marginTop: 8 },

  // Status pill
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '600' },
});
