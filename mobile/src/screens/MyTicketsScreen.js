import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getMyTickets } from '../api/client';
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

function TicketCard({ ticket, onPress }) {
  const date = new Date(ticket.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
  const fileCount = ticket.files?.length || 0;

  return (
    <Pressable style={styles.card} onPress={() => onPress(ticket)}>
      <View style={styles.cardAccent} />
      <View style={styles.cardTop}>
        <Text style={styles.ticketId}>{ticket.id}</Text>
        <StatusPill status={ticket.status} />
      </View>
      <Text style={styles.complaint} numberOfLines={3}>{ticket.complaint}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaItem}>📅 {date}</Text>
        <Text style={styles.metaItem}>📎 {fileCount} file{fileCount !== 1 ? 's' : ''}</Text>
      </View>
      {ticket.notes?.length > 0 && (
        <View style={styles.notesBadge}>
          <Text style={styles.notesBadgeText}>{ticket.notes.length} update{ticket.notes.length !== 1 ? 's' : ''} from DMC</Text>
        </View>
      )}
    </Pressable>
  );
}

export function MyTicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  function onRefresh() {
    setRefreshing(true);
    load();
  }

  function onTicketPress(ticket) {
    navigation.navigate('TicketDetail', { ticket });
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.blue3} size="large" />
        <Text style={styles.loadingText}>Loading complaints…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue3}
            colors={[colors.blue]}
          />
        }
        renderItem={({ item }) => <TicketCard ticket={item} onPress={onTicketPress} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Complaints</Text>
            <Text style={styles.headerSub}>
              {tickets.length} complaint{tickets.length !== 1 ? 's' : ''} filed
            </Text>
          </View>
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>❌</Text>
              <Text style={styles.emptyTitle}>Failed to load</Text>
              <Text style={styles.emptySub}>{error}</Text>
              <Pressable style={styles.retryBtn} onPress={load}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No complaints filed yet</Text>
              <Text style={styles.emptySub}>File a complaint directly or via the AI helpline call.</Text>
              <View style={styles.emptyActions}>
                <Pressable style={styles.ctaBtn} onPress={() => navigation.navigate('CreateTicket')}>
                  <Text style={styles.ctaText}>📝 File Complaint</Text>
                </Pressable>
                <Pressable style={styles.ctaBtnOutline} onPress={() => navigation.navigate('CallTab')}>
                  <Text style={styles.ctaOutlineText}>📞 Call Simulation</Text>
                </Pressable>
              </View>
            </View>
          )
        }
      />

      {/* Floating Action Button */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateTicket')}>
        <Text style={styles.fabText}>+ New</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.textSecondary, marginTop: 12, fontSize: 14 },
  list: { padding: 16, paddingBottom: 32 },

  header: { marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  headerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: colors.blue,
    opacity: 0.4,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketId: { fontSize: 15, fontWeight: '700', color: colors.blue3 },
  complaint: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: 12 },
  meta: { flexDirection: 'row', gap: 16 },
  metaItem: { fontSize: 12, color: colors.textDim },

  // Status pill
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 11, fontWeight: '600' },

  // Notes badge
  notesBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  notesBadgeText: { fontSize: 12, color: colors.purple, fontWeight: '600' },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12, opacity: 0.6 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  retryBtn: {
    marginTop: 20, paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 10,
  },
  retryText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  emptyActions: { marginTop: 20, gap: 10, width: '100%', alignItems: 'center' },
  ctaBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    backgroundColor: colors.blue, borderRadius: 10,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ctaBtnOutline: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderColor: colors.border, borderWidth: 1, borderRadius: 10,
  },
  ctaOutlineText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },

  // FAB
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: colors.blue,
    borderRadius: 28,
    paddingHorizontal: 20, paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
