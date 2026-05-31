import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { RoleProvider, useRole } from './src/context/RoleContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ArbiBotScanner } from './src/screens/ArbiBotScanner';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { OrderListScreen } from './src/screens/OrderListScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { ResaleHubScreen } from './src/screens/ResaleHubScreen';
import { COLORS, SHADOWS, SPACING } from './src/theme';

/**
 * AceProxy Mobile - 核心入口 (工业级重塑版)
 * 演示版导航：支持 首页 (Home) / 转卖 (Resale) / 套利 (Arbi) / 订单 (Orders) / 钱包 (Wallet)
 */
const MainNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const { currentTheme: theme } = useRole();

  // 模拟从后端获取的站点数据
  const mockStationData = {
    stationName: 'AceProxy Jakarta (JKT)',
    announcement: '🏮 开斋节备货季开启！1688 原厂货源利差高达 200%。',
    trendingCategories: ['穆斯林服饰', '节日家居', '极简收纳'],
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME': return <HomeScreen stationData={mockStationData} />;
      case 'RESALE': return <ResaleHubScreen />;
      case 'ARBI': return <ArbiBotScanner />;
      case 'ORDERS': return <OrderListScreen />;
      case 'WALLET': return <WalletScreen />;
      default: return <HomeScreen stationData={mockStationData} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
      <StatusBar barStyle="dark-content" />
      {renderScreen()}

      {/* 底部工业级导航栏 */}
      <View style={[styles.navBar, SHADOWS.medium]}>
        <NavButton 
          label="首页" 
          active={currentScreen === 'HOME'} 
          onPress={() => setCurrentScreen('HOME')}
          activeColor={theme.primary}
        />
        <NavButton 
          label="转卖" 
          active={currentScreen === 'RESALE'} 
          onPress={() => setCurrentScreen('RESALE')}
          activeColor={theme.primary}
        />
        <NavButton 
          label="套利" 
          active={currentScreen === 'ARBI'} 
          onPress={() => setCurrentScreen('ARBI')}
          activeColor={theme.primary}
        />
        <NavButton 
          label="订单" 
          active={currentScreen === 'ORDERS'} 
          onPress={() => setCurrentScreen('ORDERS')}
          activeColor={theme.primary}
        />
        <NavButton 
          label="钱包" 
          active={currentScreen === 'WALLET'} 
          onPress={() => setCurrentScreen('WALLET')}
          activeColor={theme.primary}
        />
      </View>
    </View>
  );
};

const NavButton = ({ label, active, onPress, activeColor }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.navBtn}>
    <View style={[styles.navIconPlaceholder, { backgroundColor: active ? activeColor : COLORS.gray[200] }]} />
    <Text style={[styles.navText, { color: active ? activeColor : COLORS.gray[400] }]}>{label}</Text>
  </TouchableOpacity>
);

export default function App() {
  return (
    <RoleProvider>
      <MainNavigator />
    </RoleProvider>
  );
}

const styles = StyleSheet.create({
  navBar: { 
    height: 85, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.gray[100],
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  navBtn: { alignItems: 'center', justifyContent: 'center' },
  navIconPlaceholder: { width: 24, height: 24, borderRadius: 6, marginBottom: 4 },
  navText: { fontSize: 11, fontWeight: '700' }
});
