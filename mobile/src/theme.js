import { StyleSheet } from 'react-native';

export const colors = {
  // Matching web landing page design system
  bg: '#060a12',
  surface: '#0d1420',
  surfaceLight: '#111827',
  border: '#1e2d45',
  borderLight: '#243447',

  // Text
  text: '#e2e8f0',
  textDim: '#64748b',
  textSecondary: '#94a3b8',

  // Brand
  blue: '#2563eb',
  blue2: '#3b82f6',
  blue3: '#60a5fa',
  cyan: '#06b6d4',
  purple: '#a855f7',
  orange: '#f97316',
  red: '#ef4444',
  green: '#22c55e',
  amber: '#f59e0b',

  // State colors (for call orb)
  idle: '#1a6080',
  listen: '#38bdf8',
  think: '#a855f7',
  speak: '#f97316',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
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
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Status pills
  statusOpen: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderColor: 'rgba(37,99,235,0.25)',
    borderWidth: 1,
  },
  statusInProgress: {
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderColor: 'rgba(168,85,247,0.25)',
    borderWidth: 1,
  },
  statusResolved: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.25)',
    borderWidth: 1,
  },
});
