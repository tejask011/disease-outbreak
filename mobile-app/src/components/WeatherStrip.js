// ─── WeatherStrip ────────────────────────────────────────────────
// Compact horizontal weather widget with temperature, humidity, and rainfall.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const WeatherItem = ({ icon, label, value, unit, color }) => (
  <View style={styles.weatherItem}>
    <View style={[styles.weatherIconWrap, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View>
      <Text style={styles.weatherValue}>
        {value}
        <Text style={styles.weatherUnit}>{unit}</Text>
      </Text>
      <Text style={styles.weatherLabel}>{label}</Text>
    </View>
  </View>
);

const WeatherStrip = ({ weather }) => {
  if (!weather) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,212,255,0.08)', 'rgba(0,212,255,0.02)']}
        style={styles.strip}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerRow}>
          <Ionicons
            name="partly-sunny"
            size={14}
            color={COLORS.primary}
          />
          <Text style={styles.headerText}>Weather Conditions</Text>
        </View>

        <View style={styles.itemsRow}>
          <WeatherItem
            icon="thermometer-outline"
            label="Temperature"
            value={weather.temp?.toFixed?.(1) || weather.temp}
            unit="°C"
            color="#FF6B6B"
          />

          <View style={styles.divider} />

          <WeatherItem
            icon="water-outline"
            label="Humidity"
            value={weather.humidity}
            unit="%"
            color="#4ECDC4"
          />

          <View style={styles.divider} />

          <WeatherItem
            icon="rainy-outline"
            label="Rainfall"
            value={weather.rainfall}
            unit="mm"
            color="#6C9CE3"
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.padding,
    marginVertical: 8,
  },
  strip: {
    borderRadius: SIZES.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerText: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    ...FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherValue: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
  weatherUnit: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    ...FONTS.regular,
  },
  weatherLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.xxs,
    ...FONTS.regular,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
});

export default WeatherStrip;
