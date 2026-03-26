import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme';

const services = [
  { icon: '🏠', title: 'Property Tax', desc: 'Check dues and payments', bg: 'rgba(37,99,235,0.12)' },
  { icon: '💧', title: 'Water Bills', desc: 'Bills and supply issues', bg: 'rgba(6,182,212,0.12)' },
  { icon: '🏗️', title: 'Building Permits', desc: 'Applications and status', bg: 'rgba(16,185,129,0.12)' },
  { icon: '⚠️', title: 'Complaints', desc: 'File civic grievances', bg: 'rgba(245,158,11,0.12)' },
  { icon: '📋', title: 'Certificates', desc: 'Birth, death, residence', bg: 'rgba(139,92,246,0.12)' },
  { icon: '🗑️', title: 'Sanitation', desc: 'Collection schedules', bg: 'rgba(236,72,153,0.12)' },
];

const steps = [
  { num: '1', icon: '📞', title: 'Call or File Online', desc: 'Dial the DMC helpline, use call simulation, or file directly.' },
  { num: '2', icon: '🤖', title: 'AI Understands', desc: 'Gemini AI processes your query and collects details.' },
  { num: '3', icon: '🎫', title: 'Ticket Created', desc: 'A complaint ticket is registered with a unique ID.' },
  { num: '4', icon: '📱', title: 'SMS & Track', desc: 'Receive SMS with upload link. Track status here.' },
];

export function HomeScreen({ navigation, user, onLogout, onNeedLogin }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>AI-Powered · 24/7 · Hindi + English</Text>
        </View>
        <Text style={styles.heroTitle}>Delhi Municipal</Text>
        <Text style={styles.heroAccent}>AI Citizen Helpline</Text>
        <Text style={styles.heroDesc}>
          File complaints, track property tax, water bills, and building permits — all through natural conversation.
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionCard, styles.actionPrimary]}
          onPress={() => navigation.navigate('CallTab')}
        >
          <Text style={styles.actionIcon}>📞</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Call Simulation</Text>
            <Text style={styles.actionSub}>Talk to AI helpline</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, styles.actionComplaint]}
          onPress={() => {
            if (user) {
              navigation.navigate('CreateTicket');
            } else {
              onNeedLogin(navigation);
            }
          }}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>File a Complaint</Text>
            <Text style={styles.actionSub}>{user ? 'Submit directly' : 'Login required'}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, styles.actionSecondary]}
          onPress={() => {
            if (user) {
              navigation.navigate('MyTicketsTab');
            } else {
              onNeedLogin(navigation);
            }
          }}
        >
          <Text style={styles.actionIcon}>🎫</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Track My Ticket</Text>
            <Text style={styles.actionSub}>{user ? 'View complaints' : 'Login required'}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>24/7</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={[styles.stat, styles.statBorder]}>
          <Text style={styles.statNum}>3</Text>
          <Text style={styles.statLabel}>Languages</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>AI</Text>
          <Text style={styles.statLabel}>Powered</Text>
        </View>
      </View>

      {/* Services */}
      <Text style={styles.sectionTitle}>Municipal Services</Text>
      <View style={styles.grid}>
        {services.map((s) => (
          <View key={s.title} style={styles.serviceCard}>
            <View style={[styles.serviceIcon, { backgroundColor: s.bg }]}>
              <Text style={{ fontSize: 18 }}>{s.icon}</Text>
            </View>
            <Text style={styles.serviceName}>{s.title}</Text>
            <Text style={styles.serviceDesc}>{s.desc}</Text>
          </View>
        ))}
      </View>

      {/* How It Works */}
      <Text style={styles.sectionTitle}>How It Works</Text>
      <View style={styles.stepsWrap}>
        {steps.map((s, i) => (
          <View key={i} style={styles.stepCard}>
            <View style={styles.stepNum}>
              <Text style={{ fontSize: 20 }}>{s.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Auth Section */}
      <View style={styles.authSection}>
        {user ? (
          <View style={styles.userCard}>
            <View>
              <Text style={styles.userLabel}>Logged in as</Text>
              <Text style={styles.userId}>{user.id}</Text>
            </View>
            <Pressable style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.loginBtn} onPress={() => onNeedLogin(navigation)}>
            <Text style={styles.loginBtnText}>🔐  Login to Track Complaints</Text>
          </Pressable>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Delhi Municipal Corporation</Text>
        <Text style={styles.footerText}>Powered by Gemini · Google Cloud · Twilio</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 40 },

  // Hero
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.25)', borderWidth: 1,
    borderRadius: 20, marginBottom: 18,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.cyan },
  badgeText: { fontSize: 11, color: colors.blue3, fontWeight: '600' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  heroAccent: { fontSize: 26, fontWeight: '800', color: colors.blue3, textAlign: 'center', marginBottom: 10 },
  heroDesc: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20, maxWidth: 320 },

  // Actions
  actions: { paddingHorizontal: 16, gap: 10, marginTop: 20, marginBottom: 20 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 18, borderRadius: 14, borderWidth: 1,
  },
  actionPrimary: { backgroundColor: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.2)' },
  actionComplaint: { backgroundColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' },
  actionSecondary: { backgroundColor: colors.surface, borderColor: colors.border },
  actionIcon: { fontSize: 26 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  actionSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  arrow: { fontSize: 18, color: colors.textDim },

  // Stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16,
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 12, marginBottom: 28, overflow: 'hidden',
  },
  stat: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  statNum: { fontSize: 20, fontWeight: '800', color: colors.blue3 },
  statLabel: { fontSize: 11, color: colors.textDim, marginTop: 2 },

  // Sections
  sectionTitle: {
    fontSize: 18, fontWeight: '800', color: colors.text,
    paddingHorizontal: 16, marginBottom: 14, letterSpacing: -0.3,
  },

  // Services grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 28 },
  serviceCard: {
    width: '47%', backgroundColor: colors.surface,
    borderColor: colors.border, borderWidth: 1,
    borderRadius: 12, padding: 14,
  },
  serviceIcon: { width: 36, height: 36, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  serviceName: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 3 },
  serviceDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 15 },

  // Steps
  stepsWrap: { paddingHorizontal: 16, gap: 10, marginBottom: 28 },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 12, padding: 16,
  },
  stepNum: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(37,99,235,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  stepTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  stepDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },

  // Auth
  authSection: { paddingHorizontal: 16, marginBottom: 24 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1,
    borderRadius: 12, padding: 16,
  },
  userLabel: { fontSize: 11, color: colors.textDim },
  userId: { fontSize: 14, fontWeight: '600', color: colors.blue3, marginTop: 1 },
  logoutBtn: { paddingHorizontal: 16, paddingVertical: 8, borderColor: colors.border, borderWidth: 1, borderRadius: 8 },
  logoutText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  loginBtn: {
    backgroundColor: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.2)', borderWidth: 1,
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
  },
  loginBtnText: { fontSize: 15, fontWeight: '700', color: colors.blue3 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 11, color: colors.textDim, marginBottom: 4 },
});
