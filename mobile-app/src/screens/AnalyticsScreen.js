import React, { useRef, useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Rect, Text as SvgText, Svg } from 'react-native-svg';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { OutbreakContext } from '../context/OutbreakContext';
import Header from '../components/Header';
import SectionTitle from '../components/SectionTitle';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const { outbreakData, getStats } = useContext(OutbreakContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#121A2F',
    backgroundGradientTo: '#0B1120',
    color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.primaryDark }
  };

  // Dynamically extract top diseases from data to show them in line trends
  const uniqueDiseases = outbreakData.length > 0 ? [...new Set(outbreakData.flatMap(d => (d.topDiseases || []).map(t => t.name)))].slice(0, 4) : [];
  const colorPalette = [
    'rgba(255, 77, 77, OPACITY)',  // Red
    'rgba(255, 165, 0, OPACITY)',  // Orange
    'rgba(0, 212, 255, OPACITY)',  // Blue
    'rgba(0, 200, 83, OPACITY)'    // Green
  ];

  const lineDatasets = uniqueDiseases.map((disease, i) => {
    // Generate dynamic mock trend values to simulate historical metrics
    const base = 20 + i * 15;
    const dataPoints = [base, base * 1.5, base * 0.8, base * 2.2, base * 1.1, base + 30].map(v => Math.min(100, Math.round(v)));
    return {
      data: dataPoints,
      color: (opacity = 1) => colorPalette[i % colorPalette.length].replace('OPACITY', opacity),
      strokeWidth: 3
    };
  });

  const lineData = {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6"],
    datasets: lineDatasets.length > 0 ? lineDatasets : [{ data: [0], color: () => 'rgba(255,255,255,1)' }],
    legend: uniqueDiseases.length > 0 ? uniqueDiseases : ["No Data"]
  };

  // Dynamic Pie Data Risk Stats
  const stats = outbreakData.length ? getStats() : { high: 0, medium: 0, low: 0 };
  const pieData = [
    { name: "High", population: stats.high, color: COLORS.high, legendFontColor: COLORS.textSecondary, legendFontSize: 12 },
    { name: "Medium", population: stats.medium, color: COLORS.medium, legendFontColor: COLORS.textSecondary, legendFontSize: 12 },
    { name: "Low", population: stats.low, color: COLORS.low, legendFontColor: COLORS.textSecondary, legendFontSize: 12 }
  ];

  // Dynamic Bar Data by City
  const cityRiskMap = {};
  outbreakData.forEach(d => {
    if (d.city && d.prediction) {
      cityRiskMap[d.city] = (cityRiskMap[d.city] || 0) + (d.prediction.level === 'HIGH' ? 30 : d.prediction.level === 'MEDIUM' ? 15 : 5);
    }
  });
  const barCities = Object.keys(cityRiskMap).slice(0, 5);
  const barData = {
    labels: barCities.length > 0 ? barCities.map(c => c.substring(0, 3).toUpperCase()) : ['N/A'],
    datasets: [
      {
        data: barCities.length > 0 ? barCities.map(c => cityRiskMap[c]) : [0]
      }
    ]
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#0B1120', '#121A2F', '#0B1120']} style={styles.gradient}>
        <Header />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Animated.View style={{ opacity: fadeAnim }}>
            
            <SectionTitle icon="trending-up" title="Disease Trends Over Time" color={COLORS.primary} />
            <View style={styles.chartContainer}>
              <LineChart
                data={lineData}
                width={width - SIZES.padding * 2}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
                onDataPointClick={(data) => {
                  let isSamePoint = tooltipPos.x === data.x && tooltipPos.y === data.y;
                  isSamePoint
                    ? setTooltipPos((prevState) => ({ ...prevState, visible: !prevState.visible }))
                    : setTooltipPos({ x: data.x, y: data.y, value: data.value, visible: true });
                }}
                decorator={() => {
                  return tooltipPos.visible ? (
                    <View>
                      <Svg>
                        <Rect x={tooltipPos.x - 15} y={tooltipPos.y + 10} width="40" height="24" fill={COLORS.primary} rx={4} />
                        <SvgText x={tooltipPos.x + 5} y={tooltipPos.y + 26} fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">
                          {tooltipPos.value}
                        </SvgText>
                      </Svg>
                    </View>
                  ) : null;
                }}
              />
            </View>

            <SectionTitle icon="pie-chart" title="Overall Risk Distribution" color={COLORS.primary} />
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                width={width - SIZES.padding * 2}
                height={220}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
                style={styles.chartStyle}
              />
            </View>

            <SectionTitle icon="bar-chart" title="City Risk Index" color={COLORS.primary} />
            <View style={styles.chartContainer}>
              <BarChart
                data={barData}
                width={width - SIZES.padding * 2}
                height={220}
                fromZero={true}
                showValuesOnTopOfBars={true}
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 77, 77, ${opacity})`
                }}
                verticalLabelRotation={0}
                style={styles.chartStyle}
              />
            </View>

            <View style={{height: 100}} />
          </Animated.View>
        </ScrollView>
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
  scroll: {
    paddingTop: 10,
  },
  chartContainer: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCardHover, // Glassmorphism base
    ...SHADOWS.card
  },
  chartStyle: {
    borderRadius: SIZES.radiusLg,
  }
});

export default AnalyticsScreen;
