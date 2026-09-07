/**
 * AceProxy Mobile App — Entry Point
 * 
 * 架构: React Navigation + Zustand + DESIGN.md 对齐
 * 支持: 5-Tab 底部导航 + 模态页面栈
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { RoleProvider } from './src/context/RoleContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';

function AppContent() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <ErrorBoundary>
      <StatusBar barStyle="dark-content" backgroundColor="#fefaf7" />
      <RootNavigator />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  );
}
