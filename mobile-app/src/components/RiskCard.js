// ─── RiskCard ────────────────────────────────────────────────────
// Area risk list card with colored left border, risk badge, confidence,
// disease tag, and press animation. HIGH cards get glow treatment.

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  getRiskColor,
  getRiskGradient,
} from '../constants/theme';

const RiskCard = ({ item, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const riskColor = getRiskColor(item.prediction.level);
  const isHigh = item.prediction.level === 'HIGH';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress?.(item)}
    >
      <Animated.View
        style={[
          styles.cardOuter,
          isHigh && SHADOWS.glow(COLORS.high),
          isHigh && styles.highBorder,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={getRiskGradient(item.prediction.level)}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Left colored stripe */}
          <View style={[styles.leftStripe, { backgroundColor: riskColor }]} />

          <View style={styles.content}>
            {/* Top Row: Location + Risk Badge */}
            <View style={styles.topRow}>
              <View style={styles.locationWrap}>
                <Ionicons
                  name="location-sharp"
                  size={16}
                  color={riskColor}
                />
                <View>
                  <Text style={styles.areaName}>
                    {item.area}
                    <Text style={styles.cityName}> · {item.city}</Text>
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.riskBadge,
                  { backgroundColor: `${riskColor}20` },
                  isHigh && { borderWidth: 1, borderColor: `${riskColor}60` },
                ]}
              >
                {isHigh && (
                  <Ionicons name="warning" size={10} color={riskColor} />
                )}
                <Text style={[styles.riskText, { color: riskColor }]}>
                  {item.prediction.level}
                </Text>
              </View>
            </View>

            {/* Middle Row: Disease + Prediction Metrics */}
            <View style={styles.middleRow}>
              <View style={styles.diseaseTag}>
                <Ionicons
                  name="medkit"
                  size={12}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.diseaseText}>
                  {item.prediction.disease}
                </Text>
              </View>

              <View style={styles.metricsContainer}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>RISK</Text>
                  <Text style={[styles.riskValue, { color: riskColor }]}>
                    {item.prediction.riskScore}
                  </Text>
                </View>

                <View style={[styles.metricItem, { marginLeft: 12 }]}>
                  <Text style={styles.metricLabel}>CERT.</Text>
                  <Text style={styles.confValue}>
                    {item.prediction.confidence}
                  </Text>
                </View>
              </View>
            </View>


            {/* Bottom Row: Expected + Arrow */}
            <View style={styles.bottomRow}>
              <View style={styles.expectedWrap}>
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={COLORS.textMuted}
                />
                <Text style={styles.expectedText}>
                  Expected: {item.prediction.expectedOutbreak}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textMuted}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    marginHorizontal: SIZES.padding,
    marginBottom: 12,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  highBorder: {
    borderColor: 'rgba(255, 77, 77, 0.35)',
  },
  card: {
    flexDirection: 'row',
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
  },
  leftStripe: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  areaName: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
  cityName: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.regular,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    gap: 4,
  },
  riskText: {
    fontSize: SIZES.xxs,
    ...FONTS.bold,
    letterSpacing: 1,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diseaseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.radiusXs,
  },
  diseaseText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'flex-end',
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    ...FONTS.bold,
    letterSpacing: 0.5,
    marginBottom: -2,
  },
  riskValue: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
  },
  confValue: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    ...FONTS.semiBold,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expectedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  expectedText: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    ...FONTS.regular,
  },
});

export default RiskCard;
