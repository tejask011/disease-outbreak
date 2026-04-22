import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { OutbreakProvider } from './src/context/OutbreakContext';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from './src/constants/theme';

import DashboardScreen from './src/screens/DashboardScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import UploadScreen from './src/screens/UploadScreen';
import AreaDetailScreen from './src/screens/AreaDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.bgDark,
    card: COLORS.bgDark,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.high,
  },
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1120',
          borderTopColor: 'rgba(255,255,255,0.05)',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: SIZES.xxs,
          ...FONTS.bold,
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <OutbreakProvider>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.bgDark },
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        >
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="AreaDetail" 
            component={AreaDetailScreen} 
            options={{
              presentation: 'transparentModal',
              cardStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </OutbreakProvider>
  );
}
