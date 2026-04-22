// ─── StatsCard ───────────────────────────────────────────────────
// Glassmorphism summary card with icon, value, and label.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

const StatsCard = ({ icon, label, value, color, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[`${color}18`, `${color}06`]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>

        {/* Value */}
        <Text style={[styles.value, { color }]}>{value}</Text>

        {/* Label */}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '22%',
  },
  card: {
    borderRadius: SIZES.radius,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: SIZES.xxl,
    ...FONTS.bold,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: SIZES.xxs,
    ...FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});

export default StatsCard;
