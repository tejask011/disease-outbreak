import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES, SHADOWS, getRiskColor } from '../constants/theme';

const { width } = Dimensions.get('window');

// Error Boundary to catch react-native-maps crashes in Expo Go
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('MapView crashed:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={fallbackStyles.container}>
          <LinearGradient
            colors={['rgba(18, 26, 47, 0.95)', 'rgba(11, 17, 32, 0.95)']}
            style={fallbackStyles.gradient}
          >
            <Text style={fallbackStyles.icon}>🗺️</Text>
            <Text style={fallbackStyles.title}>Map Unavailable</Text>
            <Text style={fallbackStyles.subtitle}>
              Maps require a development build.{'\n'}Use the web dashboard for map view.
            </Text>
          </LinearGradient>
        </View>
      );
    }
    return this.props.children;
  }
}

const fallbackStyles = StyleSheet.create({
  container: {
    height: 350,
    width: width,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  icon: { fontSize: 48 },
  title: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.bold,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.sm,
    ...FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Lazy load MapView to prevent crash on import
let MapView = null;
let Marker = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
} catch (e) {
  console.warn('react-native-maps not available:', e.message);
}

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
      <View style={[styles.markerContainer, { width: totalSize, height: totalSize }]}>
        {/* Outer glow ring */}
        <View
          style={[
            styles.outerRing,
            {
              width: totalSize,
              height: totalSize,
              borderRadius: totalSize / 2,
              backgroundColor: `${color}35`,
            },
          ]}
        />
        {/* Core dot — solid, bright, fully opaque */}
        <View
          style={[
            styles.coreDot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
            },
          ]}
        />
      </View>
    </Marker>
  );
};

const LiveMap = ({ data, onMarkerPress }) => {
  const mapRef = useRef(null);

  // Center roughly in India
  const initialRegion = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 15.0,
    longitudeDelta: 15.0,
  };

  useEffect(() => {
    // Zoom to fit filtered coordinates when data changes
    if (mapRef.current && data && data.length > 0) {
      const coords = data.filter(d => d.coordinates).map(d => d.coordinates);
      if (coords.length > 0) {
        if (coords.length === 1) {
          mapRef.current.animateToRegion({
            ...coords[0],
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }, 1000);
        } else {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    }
  }, [data]);

  // Check if we have coordinate data to avoid maps crashing
  const hasCoordinates = data.some(d => d.coordinates);

  if (!hasCoordinates) {
     return <View style={styles.fallback}><Text style={{color: '#fff'}}>No coordinate data available</Text></View>
  }

  // If MapView is not available (import failed), show fallback
  if (!MapView) {
    return (
      <View style={styles.fallback}>
        <Text style={{color: COLORS.textPrimary, fontSize: SIZES.md, ...FONTS.bold}}>🗺️ Map Unavailable</Text>
        <Text style={{color: COLORS.textMuted, fontSize: SIZES.sm, textAlign: 'center', marginTop: 8}}>
          Maps require a development build
        </Text>
      </View>
    );
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
    height: 350,
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
    overflow: 'visible',
  },
  outerRing: {
    position: 'absolute',
  },
  coreDot: {
    position: 'absolute',
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

