import React, { useState, useEffect } from 'react';

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
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { COLORS, SHADOWS } from './src/theme';


import { LoginScreen } from './src/screens/LoginScreen';

/**
 * AceProxy Mobile - 核心入口 (工业级重塑版)
 * 演示版导航：支持 首页 (Home) / 发现 (Discovery) / 助手 (Arbi) / 清单 (Cart) / 我的 (Profile)
 */
const MainNavigator = () => {
  const [currentScreen, setCurrentScreen] = useState('LOGIN');

  const [hasChatNotification, setHasChatNotification] = useState(true);
  const { currentTheme: theme } = useRole();

  // 模拟 AI Steward 的实时推送感知
  useEffect(() => {
    // 雅加达试点期，默认带有一个来自管家的“首单砍价成功”提醒
    const timer = setTimeout(() => setHasChatNotification(true), 5000);
    return () => clearTimeout(timer);
  }, []);


  // 模拟从后端获取的站点数据
  const mockStationData = {
    stationName: 'AceProxy Jakarta (JKT)',
    announcement: '🏮 开斋节备货季开启！全球源头货源价格优势高达 200%。',
    trendingCategories: ['穆斯林服饰', '节日家居', '极简收纳'],
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LOGIN': return <LoginScreen onLogin={() => setCurrentScreen('ONBOARDING')} />;
      case 'ONBOARDING': return <OnboardingScreen onConfirm={() => setCurrentScreen('HOME')} />;
      case 'HOME': return <HomeScreen stationData={mockStationData} />;
      case 'DISCOVERY': return <ResaleHubScreen />;
      case 'ARBI': return <ArbiBotScanner />;
      case 'CART': return <CartScreen />;
      case 'PROFILE': return <MemberCenterScreen />;
      case 'PDP': return <ProductDetailScreen onBack={() => setCurrentScreen('HOME')} />; // 内部跳转用
      case 'QC': return <HonestQCReportScreen navigation={{ goBack: () => setCurrentScreen('ORDERS') }} />; 
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

      {/* 底部大厂标准导航栏 (5-Tab) - 仅在非引导页显示 */}
      {currentScreen !== 'ONBOARDING' && currentScreen !== 'LOGIN' && (
        <View style={[styles.navBar, SHADOWS.medium]}>
          <NavButton 
            label={t.home} 
            active={currentScreen === 'HOME'} 
            onPress={() => setCurrentScreen('HOME')}
            activeColor={theme.primary}
          />
          <NavButton 
            label="Discovery" 
            active={currentScreen === 'DISCOVERY'} 
            onPress={() => setCurrentScreen('DISCOVERY')}
            activeColor={theme.primary}
          />
          <NavButton 
            label="Assistant" 
            active={currentScreen === 'CHAT'} 
            onPress={() => {
              setCurrentScreen('CHAT');
              setHasChatNotification(false);
            }}
            activeColor={theme.primary}
            hasBadge={hasChatNotification}
          />
          <NavButton 
            label="Wallet" 
            active={currentScreen === 'CART'} 
            onPress={() => setCurrentScreen('CART')}
            activeColor={theme.primary}
          />
          <NavButton 
            label="Profile" 
            active={currentScreen === 'PROFILE'} 
            onPress={() => setCurrentScreen('PROFILE')}
            activeColor={theme.primary}
          />
        </View>
      )}
    </View>
  );

};

const NavButton = ({ label, active, onPress, activeColor, hasBadge }) => (
  <TouchableOpacity onPress={onPress} style={styles.navBtn} activeOpacity={0.7}>
    <View style={{ position: 'relative' }}>
      <View style={[styles.navIconPlaceholder, { backgroundColor: active ? activeColor : '#E2E8F0' }]} />
      {hasBadge && (
        <View style={{ 
          position: 'absolute', 
          top: -2, 
          right: -2, 
          width: 8, 
          height: 8, 
          borderRadius: 4, 
          backgroundColor: '#EF4444', 
          borderWidth: 1, 
          borderColor: '#FFF' 
        }} />
      )}
    </View>
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
