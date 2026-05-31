import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { RoleProvider } from './src/context/RoleContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ArbiBotScanner } from './src/screens/ArbiBotScanner';
import { PaymentScreen } from './src/screens/PaymentScreen';

/**
 * AceProxy Mobile - 核心入口
 * 演示版导航：支持 首页 (Home) / 套利 (Arbi) / 支付 (Pay)
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('HOME');

  // 模拟从后端获取的站点数据
  const mockStationData = {
    stationName: 'AceProxy Jakarta (JKT)',
    announcement: '🏮 开斋节备货季开启！1688 原厂货源利差高达 200%。',
    trendingCategories: ['穆斯林服饰', '节日家居', '极简收纳'],
  };

  return (
    <RoleProvider>
      <View style={{ flex: 1 }}>
        {currentScreen === 'HOME' && <HomeScreen stationData={mockStationData} />}
        {currentScreen === 'ARBI' && <ArbiBotScanner />}
        {currentScreen === 'PAY' && <PaymentScreen />}

        {/* 底部演示导航栏 */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => setCurrentScreen('HOME')}><Text>首页</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentScreen('ARBI')}><Text>套利</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentScreen('PAY')}><Text>支付</Text></TouchableOpacity>
        </View>
      </View>
    </RoleProvider>
  );
}

const styles = StyleSheet.create({
  navBar: { 
    height: 60, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#eee' 
  }
});
