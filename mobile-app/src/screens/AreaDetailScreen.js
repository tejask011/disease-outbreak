// ─── AreaDetailScreen ────────────────────────────────────────────
// Detail view for a selected area: disease breakdown, risk score,
// growth indicators, weather impact, and data timeline.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
  getRiskColor,
  getRiskGlow,
} from '../constants/theme';

const AreaDetailScreen = ({ route, navigation }) => {
  const area = route.params?.area || { area: 'Unknown', city: 'Unknown', prediction: { level: 'LOW', riskScore: 0 } };
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const riskColor = getRiskColor(area.prediction?.level);
  const isHigh = area.prediction?.level === 'HIGH';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Decoupled scores
  const riskScore = area.prediction.riskScore || 0;
  const confidence = area.prediction.confidence || "0%";

  // Backend-driven growth data
  const growthTrend = area.prediction.trend || (isHigh ? 'Outbreak Spike' : riskScore > 50 ? 'Steady Growth' : 'Stable');
  const growthIcon = (area.prediction.riskScore || 0) > 75 ? 'trending-up' : (area.prediction.riskScore || 0) > 45 ? 'arrow-up' : 'remove';
  const growthColor = (area.prediction.riskScore || 0) > 75 ? COLORS.high : (area.prediction.riskScore || 0) > 45 ? COLORS.medium : COLORS.low;


  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity 
        style={StyleSheet.absoluteFillObject} 
        activeOpacity={1} 
        onPress={() => navigation.goBack()} 
      />
      <Animated.View style={[styles.modalCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient
        colors={['rgba(18, 26, 47, 0.95)', 'rgba(11, 17, 32, 0.95)']}
        style={styles.gradient}
      >
        {/* ── Custom Header ─── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Area Detail</Text>
            <Text style={styles.headerSub}>{area.area}, {area.city}</Text>
          </View>

          <View style={[styles.riskIndicator, { backgroundColor: `${riskColor}20` }]}>
            <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
            <Text style={[styles.riskIndicatorText, { color: riskColor }]}>
              {area.prediction.level}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View>
            {/* ── Hero Card ─── */}
            <LinearGradient
              colors={[`${riskColor}15`, `${riskColor}05`]}
              style={[
                styles.heroCard,
                isHigh && {
                  borderColor: `${riskColor}50`,
                  ...SHADOWS.glow(riskColor),
                },
              ]}
            >
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroArea}>{area.area}</Text>
                  <Text style={styles.heroCity}>{area.city}</Text>
                </View>
                <View style={styles.heroConfidence}>
                  <Text style={[styles.heroConfNum, { color: riskColor }]}>
                    {riskScore}
                  </Text>
                  <Text style={styles.heroConfLabel}>RISK SCORE</Text>
                </View>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroBottom}>
                <View style={styles.heroStat}>
                  <Ionicons name="shield-checkmark" size={16} color={riskColor} />
                  <Text style={styles.heroStatLabel}>Confidence</Text>
                  <Text style={[styles.heroStatValue, { color: COLORS.textSecondary }]}>
                    {confidence}
                  </Text>
                </View>
                <View style={styles.heroStat}>
                  <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                  <Text style={styles.heroStatLabel}>Expected</Text>
                  <Text style={styles.heroStatValue}>
                    {area.prediction.expectedOutbreak}
                  </Text>
                </View>
                <View style={styles.heroStat}>
                  <Ionicons name={growthIcon} size={16} color={growthColor} />
                  <Text style={styles.heroStatLabel}>Trend</Text>
                  <Text style={[styles.heroStatValue, { color: growthColor }]}>
                    {growthTrend}
                  </Text>
                </View>
              </View>
            </LinearGradient>


            {/* ── Risk Score Visual ─── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="speedometer-outline" size={16} color={COLORS.primary} />
                {'  '}Risk Score
              </Text>
              <LinearGradient
                colors={['rgba(0,212,255,0.06)', 'rgba(0,212,255,0.02)']}
                style={styles.sectionCard}
              >
                <View style={styles.riskScoreRow}>
                  <View style={styles.riskScoreLeft}>
                    <Text style={[styles.riskScoreNum, { color: riskColor }]}>
                      {riskScore}
                    </Text>
                    <Text style={styles.riskScoreMax}>/100</Text>
                  </View>
                  <View style={styles.riskBarContainer}>
                    <View style={styles.riskBarBg}>
                      <LinearGradient
                        colors={[riskColor, `${riskColor}80`]}
                        style={[styles.riskBarFill, { width: `${riskScore}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <View style={styles.riskBarLabels}>
                      <Text style={styles.riskBarLabel}>Low</Text>
                      <Text style={styles.riskBarLabel}>Medium</Text>
                      <Text style={styles.riskBarLabel}>High</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* ── Disease Breakdown ─── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="analytics-outline" size={16} color={COLORS.primary} />
                {'  '}Disease Breakdown
              </Text>
              <View style={styles.diseaseList}>
                {area.topDiseases && area.topDiseases.map((disease, index) => {
                  const dColor = getRiskColor(disease.level);
                  const dProb = parseInt(disease.probability) || 0;
                  return (
                    <LinearGradient
                      key={index}
                      colors={[`${dColor}10`, `${dColor}04`]}
                      style={styles.diseaseCard}
                    >
                      <View style={styles.diseaseTop}>
                        <View style={styles.diseaseNameWrap}>
                          <View
                            style={[
                              styles.diseaseDot,
                              { backgroundColor: dColor },
                            ]}
                          />
                          <Text style={styles.diseaseName}>{disease.name}</Text>
                        </View>
                        <Text style={[styles.diseaseProb, { color: dColor }]}>
                          {disease.probability}
                        </Text>
                      </View>
                      <View style={styles.diseaseBarBg}>
                        <LinearGradient
                          colors={[dColor, `${dColor}60`]}
                          style={[styles.diseaseBarFill, { width: `${dProb}%` }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </View>
                    </LinearGradient>
                  );
                })}
              </View>
            </View>

            {/* ── Weather Impact ─── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="cloud-outline" size={16} color={COLORS.primary} />
                {'  '}Weather Impact
              </Text>
              <LinearGradient
                colors={['rgba(0,212,255,0.06)', 'rgba(0,212,255,0.02)']}
                style={styles.sectionCard}
              >
                <View style={styles.weatherGrid}>
                  <WeatherMini
                    icon="thermometer-outline"
                    label="Temperature"
                    value={`${area.weather?.temp || '--'}°C`}
                    color="#FF6B6B"
                    impact={(area.weather?.temp || 0) > 30 ? 'High Heat' : 'Optimal'}
                    impactColor={(area.weather?.temp || 0) > 30 ? COLORS.medium : COLORS.low}
                  />
                  <WeatherMini
                    icon="water-outline"
                    label="Humidity"
                    value={`${area.weather?.humidity || '--'}%`}
                    color="#4ECDC4"
                    impact={(area.weather?.humidity || 0) > 60 ? 'Favorable' : 'Normal'}
                    impactColor={(area.weather?.humidity || 0) > 60 ? COLORS.high : COLORS.low}
                  />
                  <WeatherMini
                    icon="rainy-outline"
                    label="Rainfall"
                    value={`${area.weather?.rainfall || 0}mm`}
                    color="#6C9CE3"
                    impact={(area.weather?.rainfall || 0) > 5 ? 'High Risk' : 'Low impact'}
                    impactColor={(area.weather?.rainfall || 0) > 5 ? COLORS.high : COLORS.low}
                  />
                </View>

              </LinearGradient>
            </View>


            {/* ── Summary ─── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
                {'  '}AI Summary
              </Text>
              <LinearGradient
                colors={[`${riskColor}10`, `${riskColor}03`]}
                style={[styles.summaryCard, { borderLeftColor: riskColor }]}
              >
                <Text style={styles.summaryText}>{area.summary}</Text>
                <Text style={styles.summaryTime}>
                  Updated: {new Date(area.updatedAt).toLocaleString()}
                </Text>
              </LinearGradient>
            </View>

            {/* Bottom spacer */}
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </LinearGradient>
      </Animated.View>
    </View>
  );
};

// ─── WeatherMini sub-component ──────────────────────────────────
const WeatherMini = ({ icon, label, value, color, impact, impactColor }) => (
  <View style={miniStyles.container}>
    <View style={miniStyles.topRow}>
      <View style={[miniStyles.iconWrap, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View>
        <Text style={miniStyles.value}>{value}</Text>
        <Text style={miniStyles.label}>{label}</Text>
      </View>
    </View>
    <View style={[miniStyles.impactBadge, { backgroundColor: `${impactColor}15` }]}>
      <Ionicons name="information-circle" size={10} color={impactColor} />
      <Text style={[miniStyles.impactText, { color: impactColor }]}>{impact}</Text>
    </View>
  </View>
);

const miniStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.bold,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: SIZES.xxs,
    ...FONTS.regular,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: SIZES.radiusXs,
    gap: 3,
  },
  impactText: {
    fontSize: SIZES.xxs,
    ...FONTS.medium,
  },
});

// ─── Main Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalCard: {
    width: '92%',
    maxHeight: '85%',
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...SHADOWS.cardLg,
  },
  gradient: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.bold,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: SIZES.xs,
    ...FONTS.regular,
    marginTop: 2,
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.radiusFull,
    gap: 5,
  },
  riskDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  riskIndicatorText: {
    fontSize: SIZES.xxs,
    ...FONTS.bold,
    letterSpacing: 0.8,
  },
  scrollContent: {
    paddingTop: 16,
  },
  heroCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    ...SHADOWS.card,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroArea: {
    color: COLORS.textPrimary,
    fontSize: SIZES.xxl,
    ...FONTS.bold,
  },
  heroCity: {
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
    ...FONTS.regular,
    marginTop: 2,
  },
  heroConfidence: {
    alignItems: 'center',
  },
  heroConfNum: {
    fontSize: SIZES.xxxl,
    ...FONTS.bold,
  },
  heroConfLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.xxs,
    ...FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  heroBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStat: {
    alignItems: 'center',
    gap: 4,
  },
  heroStatLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.xxs,
    ...FONTS.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroStatValue: {
    color: COLORS.textPrimary,
    fontSize: SIZES.sm,
    ...FONTS.bold,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.lg,
    ...FONTS.bold,
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
  },
  sectionCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  riskScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  riskScoreLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  riskScoreNum: {
    fontSize: 40,
    ...FONTS.bold,
  },
  riskScoreMax: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    ...FONTS.regular,
  },
  riskBarContainer: {
    flex: 1,
    gap: 6,
  },
  riskBarBg: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  riskBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskBarLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.xxs,
    ...FONTS.regular,
  },
  diseaseList: {
    paddingHorizontal: SIZES.padding,
    gap: 10,
  },
  diseaseCard: {
    borderRadius: SIZES.radiusSm,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  diseaseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diseaseNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diseaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  diseaseName: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    ...FONTS.semiBold,
  },
  diseaseProb: {
    fontSize: SIZES.lg,
    ...FONTS.bold,
  },
  diseaseBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  diseaseBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  weatherGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    padding: 16,
    gap: 10,
  },
  summaryText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    ...FONTS.regular,
    lineHeight: 20,
  },
  summaryTime: {
    color: COLORS.textMuted,
    fontSize: SIZES.xxs,
    ...FONTS.regular,
  },
});

export default AreaDetailScreen;
