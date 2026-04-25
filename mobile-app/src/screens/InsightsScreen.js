import React, { useContext } from 'react';
import { View, StyleSheet, FlatList, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { OutbreakContext } from '../context/OutbreakContext';
import Header from '../components/Header';
import RiskCard from '../components/RiskCard';
import SectionTitle from '../components/SectionTitle';

const InsightsScreen = ({ navigation }) => {
  const { outbreakData } = useContext(OutbreakContext);

  // Sort by risk score descending (highest risk first)
  const sortedData = [...outbreakData].sort(
    (a, b) => (b.prediction?.riskScore || 0) - (a.prediction?.riskScore || 0)
  );

  const handleCardPress = (item) => {
    navigation.navigate('AreaDetail', { area: item });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <LinearGradient colors={['#0B1120', '#121A2F', '#0B1120']} style={styles.gradient}>
        <Header />
        
        <FlatList
          data={sortedData}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <SectionTitle icon="albums-outline" title="All Area Insights" count={sortedData.length} color={COLORS.primary} />
          }
          renderItem={({ item }) => (
            <RiskCard item={item} onPress={handleCardPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
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
  listContent: {
    paddingTop: 10,
  }
});

export default InsightsScreen;
