import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SIZES, FONTS } from '../constants/theme';
import { OutbreakContext } from '../context/OutbreakContext';

import Header from '../components/Header';
import AlertCard from '../components/AlertCard';
import StatsCard from '../components/StatsCard';
import RiskCard from '../components/RiskCard';
import SectionTitle from '../components/SectionTitle';
import LiveMap from '../components/LiveMap';

const { height } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { outbreakData, loading, error, getHighRiskAreas, getStats, refreshData } = useContext(OutbreakContext);

  const highRiskAreas = outbreakData.length ? getHighRiskAreas() : [];
  const stats = outbreakData.length ? getStats() : { total: 0, high: 0, medium: 0, low: 0 };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCardPress = (item) => {
    navigation.navigate('AreaDetail', { area: item });
  };

  const ListHeader = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      
      {/* ── Summary Stats Row (Top) ─── */}
      <View style={[styles.statsContainer, { paddingTop: 10 }]}>
        <SectionTitle icon="stats-chart" title="Overview" color={COLORS.primary} />
        <View style={styles.statsRow}>
          <StatsCard icon="globe-outline" label="Total" value={stats.total} color={COLORS.primary} delay={0} />
          <StatsCard icon="alert-circle" label="High" value={stats.high} color={COLORS.high} delay={100} />
          <StatsCard icon="warning-outline" label="Medium" value={stats.medium} color={COLORS.medium} delay={200} />
          <StatsCard icon="shield-checkmark" label="Low" value={stats.low} color={COLORS.low} delay={300} />
        </View>
      </View>

      {/* ── MAP AS MAIN SECTION ─── */}
      <View style={styles.mapWrapper}>
        {outbreakData.length > 0 && <LiveMap data={outbreakData} onMarkerPress={handleCardPress} />}
      </View>

      {/* ── High Risk List Header ─── */}
      <SectionTitle icon="warning" title="High Risk Areas" count={highRiskAreas.length} color={COLORS.high} />
    </Animated.View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <LinearGradient colors={['#0B1120', '#121A2F', '#0B1120']} style={styles.gradient}>
        <Header />
        {loading && !refreshing ? (
          <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
            <SectionTitle title="Loading Risk Data..." color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
            <SectionTitle title="Error Loading Data" color={COLORS.high} />
          </View>
        ) : outbreakData.length === 0 ? (
          <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="scan-outline" size={80} color={COLORS.primarySoft} />
            </View>
            <SectionTitle title="Surveillance Active" color={COLORS.low} />
            <Text style={styles.emptyText}>
              No disease outbreaks detected in the last 30 days. Your monitored areas are currently stable.
            </Text>
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color={COLORS.textPrimary} />
              <Text style={styles.refreshBtnText}>Check Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={highRiskAreas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <RiskCard item={item} onPress={handleCardPress} />
            )}
            ListHeaderComponent={ListHeader}
            ListFooterComponent={() => <View style={{ height: 100 }} />}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
                colors={[COLORS.primary]}
                progressBackgroundColor={COLORS.bgMedium}
              />
            }
          />
        )}

      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  gradient: {
    flex: 1,
  },
  mapWrapper: {
    position: 'relative',
    height: height * 0.45, // Map dominates almost half the screen
    marginBottom: SIZES.padding,
  },
  floatingAlerts: {
    position: 'absolute',
    top: 10,
    width: '100%',
    zIndex: 10, // Float above the map
  },
  alertScroll: {
    paddingHorizontal: SIZES.padding,
  },
  statsContainer: {
    marginBottom: SIZES.padding,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    gap: 10,
  },
  emptyStateIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 22,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    gap: 8,
  },
  refreshBtnText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.sm,
    ...FONTS.bold,
  }
});


export default React.memo(DashboardScreen);
