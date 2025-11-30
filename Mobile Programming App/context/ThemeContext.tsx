// contexts/ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceElevated: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Status colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  success: string;
  successLight: string;
  successDark: string;
  
  warning: string;
  warningLight: string;
  warningDark: string;
  
  error: string;
  errorLight: string;
  errorDark: string;
  
  // Semantic colors
  cardBackground: string;
  inputBackground: string;
  inputBorder: string;
  
  // Gradient colors
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
  
  // Shadow
  shadowColor: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const lightTheme: ThemeColors = {
  // Backgrounds
  background: '#F3F4F6',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Status
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  
  // Semantic
  cardBackground: 'rgba(255, 255, 255, 0.9)',
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  
  // Gradients
  gradientStart: '#0F172A',
  gradientMiddle: '#1E293B',
  gradientEnd: '#0F172A',
  
  // Shadow
  shadowColor: '#000000',
};

const darkTheme: ThemeColors = {
  // Backgrounds
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  
  // Text
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',
  
  // Borders
  border: '#334155',
  borderLight: '#475569',
  
  // Status
  primary: '#60A5FA',
  primaryLight: '#93C5FD',
  primaryDark: '#3B82F6',
  
  success: '#34D399',
  successLight: '#6EE7B7',
  successDark: '#10B981',
  
  warning: '#FBBF24',
  warningLight: '#FCD34D',
  warningDark: '#F59E0B',
  
  error: '#F87171',
  errorLight: '#FCA5A5',
  errorDark: '#EF4444',
  
  // Semantic
  cardBackground: 'rgba(30, 41, 59, 0.9)',
  inputBackground: '#334155',
  inputBorder: '#475569',
  
  // Gradients
  gradientStart: '#0F172A',
  gradientMiddle: '#1E3A8A',
  gradientEnd: '#0F172A',
  
  // Shadow
  shadowColor: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(systemColorScheme === 'dark' ? 'dark' : 'light');

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
