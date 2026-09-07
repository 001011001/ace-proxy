/**
 * 根导航器
 * 
 * 路由结构:
 * - 未登录: Onboarding → Login
 * - 已登录: Main Tabs (Home, Discover, Cart, Orders, Profile)
 * - 模态页面: ProductDetail, Payment, OrderTracking, Chat 等
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, MainTabParamList } from './types';

// Auth Screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';

// Main Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { CartScreen } from '../screens/CartScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { OrderListScreen } from '../screens/OrderListScreen';
import { StewardChatScreen } from '../screens/StewardChatScreen';
import { ArbiBotScanner } from '../screens/ArbiBotScanner';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AddressScreen } from '../screens/AddressScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { ResaleHubScreen } from '../screens/ResaleHubScreen';
import { CommanderDashboardScreen } from '../screens/CommanderDashboardScreen';
import { HonestQCReportScreen } from '../screens/HonestQCReportScreen';
import { MemberCenterScreen } from '../screens/MemberCenterScreen';

import { useAuthStore } from '../store/authStore';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.user.primary,
        tabBarInactiveTintColor: COLORS.user.textMute,
        tabBarStyle: {
          backgroundColor: COLORS.user.surface,
          borderTopColor: '#E8E8EF',
          paddingTop: 8,
          paddingBottom: 20,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ tabBarLabel: 'Discover' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderListScreen}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="StewardChat" component={StewardChatScreen} />
            <Stack.Screen name="ArbiBotScanner" component={ArbiBotScanner} />
            <Stack.Screen name="AddressList" component={AddressScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="ResaleHub" component={ResaleHubScreen} />
            <Stack.Screen name="CommanderDashboard" component={CommanderDashboardScreen} />
            <Stack.Screen name="HonestQCReport" component={HonestQCReportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
