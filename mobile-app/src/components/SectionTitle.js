// ─── SectionTitle ────────────────────────────────────────────────
// Reusable section header with icon, title, and optional count badge.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const SectionTitle = ({ icon, title, count, color = COLORS.textPrimary }) => (
  <View style={styles.container}>
    <View style={styles.left}>
      {icon && (
        <Ionicons name={icon} size={18} color={color} />
      )}
      <Text style={[styles.title, { color }]}>{title}</Text>
    </View>
    {count !== undefined && (
      <View style={[styles.countBadge, { backgroundColor: `${color}18` }]}>
        <Text style={[styles.countText, { color }]}>{count}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: SIZES.radiusFull,
  },
  countText: {
    fontSize: SIZES.xs,
    ...FONTS.bold,
  },
});

export default SectionTitle;
