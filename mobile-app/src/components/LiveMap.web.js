import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS, getRiskColor } from '../constants/theme';

const MapDot = ({ data, top, left, size = 10, delay = 0, onPress }) => {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const color = getRiskColor(data?.prediction?.level || 'LOW');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
           toValue: 1, duration: 1500, delay, useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
           toValue: 0.5, duration: 1500, useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.mapDot,
        {
          backgroundColor: color, top: `${top}%`, left: `${left}%`,
          width: size, height: size, borderRadius: size / 2, opacity: pulseAnim,
        },
      ]}
    >
      <TouchableOpacity 
         onPress={() => onPress && onPress(data)}
         style={[
          styles.mapDotInner,
          {
            backgroundColor: color, width: size * 2.5, height: size * 2.5, borderRadius: size * 1.25,
          },
        ]}
      />
    </Animated.View>
  );
};

const LiveMapWeb = ({ data = [], onMarkerPress }) => {
  const dots = [
    { top: 25, left: 35 }, { top: 42, left: 55 }, { top: 60, left: 30 },
    { top: 35, left: 70 }, { top: 70, left: 60 }, { top: 50, left: 20 },
    { top: 20, left: 65 }, { top: 75, left: 45 },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['rgba(0,212,255,0.06)', 'rgba(18,26,47,0.9)']} style={styles.map}>
        {[20, 40, 60, 80].map((pos) => (
          <View key={`h-${pos}`} style={[styles.gridLine, styles.hLine, { top: `${pos}%` }]} />
        ))}
        {[20, 40, 60, 80].map((pos) => (
          <View key={`v-${pos}`} style={[styles.gridLine, styles.vLine, { left: `${pos}%` }]} />
        ))}

        {data.map((item, i) => {
           let d = dots[i % dots.length];
           return (
              <MapDot
                key={item.id || i}
                data={item}
                top={d.top}
                left={d.left}
                size={item?.prediction?.level === 'HIGH' ? 14 : 10}
                delay={i * 200}
                onPress={onMarkerPress}
              />
           );
        })}

        <View style={styles.mapLabel}>
          <Ionicons name="map-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.mapLabelText}>Risk Map (Web View)</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.padding, marginVertical: 8, borderRadius: SIZES.radiusLg,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', height: 350
  },
  map: { height: '100%', borderRadius: SIZES.radiusLg, position: 'relative', overflow: 'hidden' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.03)' },
  hLine: { left: 0, right: 0, height: 1 },
  vLine: { top: 0, bottom: 0, width: 1 },
  mapDot: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  mapDotInner: { opacity: 0.2, position: 'absolute' },
  mapLabel: { position: 'absolute', top: 12, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapLabelText: { color: COLORS.textMuted, fontSize: SIZES.xs, ...FONTS.medium },
});

export default LiveMapWeb;
