/**
 * 用户相关类型
 */
export type UserRole = 'USER' | 'PARTNER' | 'RIDER' | 'ADMIN';
export type UserLevel = 'EXPLORER' | 'VOYAGER' | 'CAPTAIN' | 'ADMIRAL';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  totalSpend: number;
  credits: number;
  level: UserLevel;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  expiresIn: number;
}
