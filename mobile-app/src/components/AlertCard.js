// ─── AlertCard ───────────────────────────────────────────────────
// Critical alert card with red glow, pulse animation, and warning visuals.
// Used in the horizontal scroll section for HIGH risk areas only.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';

const AlertCard = ({ item, onPress }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow intensity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress?.(item)}>
      <Animated.View
        style={[
          styles.cardOuter,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Glow overlay */}
        <Animated.View style={[styles.glowLayer, { opacity: glowAnim }]} />

        <LinearGradient
          colors={['rgba(255,77,77,0.22)', 'rgba(255,40,40,0.08)']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Top row: icon + badge */}
          <View style={styles.topRow}>
            <View style={styles.warningBadge}>
              <Ionicons name="warning" size={14} color={COLORS.high} />
              <Text style={styles.warningText}>CRITICAL</Text>
            </View>
            <Text style={styles.confidence}>{item.prediction.confidence}</Text>
          </View>

          {/* Area + City */}
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={16} color={COLORS.high} />
            <Text style={styles.areaText} numberOfLines={1}>
              {item.area}, {item.city}
            </Text>
          </View>

          {/* Disease */}
          <View style={styles.diseaseRow}>
            <Ionicons name="medkit" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.diseaseText}>{item.prediction.disease}</Text>
          </View>

          {/* Expected */}
          <View style={styles.expectedRow}>
            <Ionicons name="time-outline" size={13} color={COLORS.high} />
            <Text style={styles.expectedText}>
              Expected: {item.prediction.expectedOutbreak}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    width: 240,
    marginRight: 16,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: 'rgba(255, 77, 77, 0.6)',
    overflow: 'hidden',
    ...SHADOWS.glow(COLORS.high),
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.highGlow,
    borderRadius: SIZES.radius,
  },
  card: {
    padding: 20,
    borderRadius: SIZES.radius,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
    gap: 5,
  },
  warningText: {
    color: COLORS.high,
    fontSize: SIZES.xxs,
    ...FONTS.bold,
    letterSpacing: 1.2,
  },
  confidence: {
    color: COLORS.high,
    fontSize: SIZES.xl,
    ...FONTS.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  areaText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.bold,
    flex: 1,
  },
  diseaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diseaseText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },
  expectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 77, 77, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusXs,
  },
  expectedText: {
    color: COLORS.high,
    fontSize: SIZES.xs,
    ...FONTS.semiBold,
  },
});

export default AlertCard;
