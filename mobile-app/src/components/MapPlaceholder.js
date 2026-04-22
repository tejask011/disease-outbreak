// ─── MapPlaceholder ──────────────────────────────────────────────
// Dark-themed map placeholder with animated colored dots for risk markers.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS, getRiskColor } from '../constants/theme';

const MapDot = ({ color, top, left, size = 10, delay = 0 }) => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.mapDot,
        {
          backgroundColor: color,
          top: `${top}%`,
          left: `${left}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: pulseAnim,
          ...SHADOWS.glowSm(color),
        },
      ]}
    >
      <View
        style={[
          styles.mapDotInner,
          {
            backgroundColor: color,
            width: size * 2.5,
            height: size * 2.5,
            borderRadius: size * 1.25,
          },
        ]}
      />
    </Animated.View>
  );
};

const MapPlaceholder = ({ data = [] }) => {
  // Generate semi-random positions based on data
  const dots = [
    { top: 25, left: 35, level: 'HIGH' },
    { top: 42, left: 55, level: 'HIGH' },
    { top: 60, left: 30, level: 'MEDIUM' },
    { top: 35, left: 70, level: 'MEDIUM' },
    { top: 70, left: 60, level: 'LOW' },
    { top: 50, left: 20, level: 'LOW' },
    { top: 20, left: 65, level: 'HIGH' },
    { top: 75, left: 45, level: 'MEDIUM' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,212,255,0.06)', 'rgba(18,26,47,0.9)']}
        style={styles.map}
      >
        {/* Grid lines */}
        {[20, 40, 60, 80].map((pos) => (
          <View key={`h-${pos}`} style={[styles.gridLine, styles.hLine, { top: `${pos}%` }]} />
        ))}
        {[20, 40, 60, 80].map((pos) => (
          <View key={`v-${pos}`} style={[styles.gridLine, styles.vLine, { left: `${pos}%` }]} />
        ))}

        {/* Dots */}
        {dots.slice(0, data.length || dots.length).map((dot, i) => (
          <MapDot
            key={i}
            color={getRiskColor(dot.level)}
            top={dot.top}
            left={dot.left}
            size={dot.level === 'HIGH' ? 12 : dot.level === 'MEDIUM' ? 10 : 8}
            delay={i * 200}
          />
        ))}

        {/* Map label */}
        <View style={styles.mapLabel}>
          <Ionicons name="map-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.mapLabelText}>Risk Distribution Map</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.high }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.medium }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.low }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.padding,
    marginVertical: 8,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  map: {
    height: 200,
    borderRadius: SIZES.radiusLg,
    position: 'relative',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  hLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  vLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  mapDot: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapDotInner: {
    opacity: 0.2,
    position: 'absolute',
  },
  mapLabel: {
    position: 'absolute',
    top: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapLabelText: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    ...FONTS.medium,
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(11,17,32,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusXs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: SIZES.xxs,
    ...FONTS.medium,
  },
});

export default MapPlaceholder;
