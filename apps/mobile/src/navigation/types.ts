/**
 * React Navigation 路由类型定义
 */

export type RootStackParamList = {
  // Auth
  Onboarding: undefined;
  Login: undefined;

  // Main (Bottom Tabs)
  Main: undefined;

  // Product
  ProductDetail: { productId: string };

  // Order
  Payment: { orderId: string };
  OrderTracking: { orderId: string };
  HonestQCReport: { parcelId: string };

  // Chat
  StewardChat: undefined;
  ArbiBotScanner: undefined;

  // Profile
  AddressList: undefined;
  AddAddress: undefined;
  Wallet: undefined;
  ResaleHub: undefined;
  CommanderDashboard: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};
