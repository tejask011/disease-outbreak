import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS, getRiskColor } from '../constants/theme';

const { width } = Dimensions.get('window');

// Custom Map Style for Dark Theme
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#121A2F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121A2F' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8a99c7' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0B1120' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1F2940' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2a3b5c' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#090e17' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

const AnimatedRiskZone = ({ data, onPress }) => {
  const isHigh = data.prediction.level === 'HIGH';
  const color = getRiskColor(data.prediction.level);
  
  // Calculate size based on confidence (for variety)
  const confidence = parseInt(data.prediction.confidence) || 50;
  const baseSize = 40 + (confidence / 2); 
  const size = isHigh ? baseSize * 1.5 : baseSize;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isHigh) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.5,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.4,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ])
      ).start();
    }
  }, [isHigh]);

  return (
    <Marker coordinate={data.coordinates} anchor={{ x: 0.5, y: 0.5 }} onPress={onPress}>
      <View style={[styles.markerContainer, { width: size * 1.5, height: size * 1.5 }]}>
         {/* Pulsing Glow (only for HIGH) */}
        {isHigh && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                width: size,
                height: size,
                backgroundColor: color,
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
        )}
        
        {/* Core Zone Circle - Matching screenshot style */}
        <View
          style={[
            styles.coreZone,
            {
              width: size * 0.8,
              height: size * 0.8,
              backgroundColor: `${color}30`, // Lightly transparent fill
              borderColor: color,
              borderWidth: 3, // Thick border
              ...(isHigh ? SHADOWS.glow(color) : {})
            },
          ]}
        />
      </View>
    </Marker>
  );
};

const LiveMap = ({ data, onMarkerPress }) => {
  // Center roughly in India
  const initialRegion = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 15.0,
    longitudeDelta: 15.0,
  };

  // Check if we have coordinate data to avoid maps crashing
  const hasCoordinates = data.some(d => d.coordinates);

  if (!hasCoordinates) {
     return <View style={styles.fallback}><Text style={{color: '#fff'}}>No coordinate data available</Text></View>
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={darkMapStyle}
      >
        {data.map((item) => (
          <AnimatedRiskZone key={item.id} data={item} onPress={() => onMarkerPress && onMarkerPress(item)} />
        ))}
      </MapView>

      {/* Floating Legend */}
      <View style={styles.legendContainer}>
        <LinearGradient
          colors={['rgba(18, 26, 47, 0.85)', 'rgba(11, 17, 32, 0.95)']}
          style={styles.legendGradient}
        >
          <Text style={styles.legendTitle}>Risk Zones</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.high, ...SHADOWS.glowSm(COLORS.high) }]} />
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
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 350, // Making it a dominant element
    width: width,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative'
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fallback: {
    height: 350,
    width: width,
    backgroundColor: COLORS.bgMedium,
    justifyContent: 'center',
    alignItems: 'center'
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 999,
  },
  coreZone: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: SIZES.radiusSm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  legendGradient: {
    padding: 12,
    gap: 8,
  },
  legendTitle: {
    color: '#fff',
    fontSize: SIZES.xs,
    ...FONTS.bold,
    marginBottom: 4,
    letterSpacing: 0.5
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.medium,
  },
});

export default LiveMap;
