import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  StatusBar
} from 'react-native';
import { RoleProvider, useRole } from './src/context/RoleContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ArbiBotScanner } from './src/screens/ArbiBotScanner';
import { PaymentScreen } from './src/screens/PaymentScreen';
import { OrderListScreen } from './src/screens/OrderListScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { ResaleHubScreen } from './src/screens/ResaleHubScreen';
import { MemberCenterScreen } from './src/screens/MemberCenterScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { CartScreen } from './src/screens/CartScreen';
import { StewardChatScreen } from './src/screens/StewardChatScreen';
import { COLORS, SHADOWS } from './src/theme';


/**
 * AceProxy Mobile - 核心入口 (工业级重塑版)
 * 演示版导航：支持 首页 (Home) / 发现 (Discovery) / 助手 (Arbi) / 清单 (Cart) / 我的 (Profile)
 */
const MainNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('HOME');
  const { currentTheme: theme } = useRole();

  // 模拟从后端获取的站点数据
  const mockStationData = {
    stationName: 'AceProxy Jakarta (JKT)',
    announcement: '🏮 开斋节备货季开启！全球源头货源价格优势高达 200%。',
    trendingCategories: ['穆斯林服饰', '节日家居', '极简收纳'],
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME': return <HomeScreen stationData={mockStationData} />;
      case 'DISCOVERY': return <ResaleHubScreen />;
      case 'ARBI': return <ArbiBotScanner />;
      case 'CART': return <CartScreen />;
      case 'PROFILE': return <MemberCenterScreen />;
      case 'PDP': return <ProductDetailScreen />; // 内部跳转用
      case 'ORDERS': return <OrderListScreen onNavigate={setCurrentScreen} />;
      case 'WALLET': return <WalletScreen />;

      case 'CHAT': return <StewardChatScreen onBack={() => setCurrentScreen('HOME')} />;
      default: return <HomeScreen stationData={mockStationData} />;

    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* 底部大厂标准导航栏 (5-Tab) */}
      <View style={[styles.navBar, SHADOWS.medium]}>
        <NavButton 
          label="首页" 
          active={currentScreen === 'HOME'} 
          onPress={() => setCurrentScreen('HOME')}
          activeColor={theme.primary}
        />
        <NavButton 
          label="发现" 
          active={currentScreen === 'DISCOVERY'} 
          onPress={() => setCurrentScreen('DISCOVERY')}
          activeColor={theme.primary}
        />
        <NavButton 
          label="助手" 
          active={currentScreen === 'ARBI'} 
          onPress={() => setCurrentScreen('ARBI')}
          activeColor={theme.primary}
        />
        <NavButton 
          label="清单" 
          active={currentScreen === 'CART'} 
          onPress={() => setCurrentScreen('CART')}
          activeColor={theme.primary}
        />
        <NavButton 
          label="我的" 
          active={currentScreen === 'PROFILE'} 
          onPress={() => setCurrentScreen('PROFILE')}
          activeColor={theme.primary}
        />
      </View>
    </View>
  );
};

const NavButton = ({ label, active, onPress, activeColor }) => (
  <TouchableOpacity onPress={onPress} style={styles.navBtn} activeOpacity={0.7}>
    <View style={[styles.navIconPlaceholder, { backgroundColor: active ? activeColor : '#E2E8F0' }]} />
    <Text style={[styles.navText, { color: active ? activeColor : '#94A3B8' }]}>{label}</Text>
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
    backgroundColor: '#FFF', 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9',
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0, left: 0, right: 0
  },
  navBtn: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navIconPlaceholder: { width: 22, height: 22, borderRadius: 6, marginBottom: 4 },
  navText: { fontSize: 10, fontWeight: '800' }
});
