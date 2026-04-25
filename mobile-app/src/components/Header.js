// ─── Header ──────────────────────────────────────────────────────
// Premium app header with gradient accent line and live status indicator.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const Header = ({ title = "Outbreak Monitor", subtitle = "Global Surveillance" }) => {
  return (
    <View style={styles.container}>
      {/* Gradient accent line */}
      <LinearGradient
        colors={['#00D4FF', '#0066FF', '#7B2FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />

      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#00D4FF', '#0066FF']}
              style={styles.logoBg}
            >
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
            </LinearGradient>
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Outbreak Monitor</Text>
            <Text style={styles.subtitle}>AI-Based Disease Surveillance</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: COLORS.bgDark,
  },
  accentLine: {
    height: 3,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    borderRadius: SIZES.radiusSm,
    overflow: 'hidden',
  },
  logoBg: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusSm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrap: {
    gap: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xl,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: SIZES.xs,
    ...FONTS.medium,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

export default Header;
