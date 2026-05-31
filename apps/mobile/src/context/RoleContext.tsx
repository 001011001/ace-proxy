import React, { createContext, useContext, useState, ReactNode } from 'react';
import { theme, RoleTheme } from '../theme';
import { translations, Language } from '../i18n';

type Role = 'USER' | 'PARTNER' | 'RIDER';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentTheme: RoleTheme;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.zh;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('USER');
  const [language, setLanguage] = useState<Language>('zh');

  // 根据角色动态切换 UI 风格
  const currentTheme = theme[role];
  const t = translations[language];

  return (
    <RoleContext.Provider value={{ role, setRole, currentTheme, language, setLanguage, t }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
};
