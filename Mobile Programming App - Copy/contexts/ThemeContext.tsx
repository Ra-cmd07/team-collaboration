// contexts/ThemeContext.tsx - ENHANCED LIGHT MODE
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
  // Backgrounds - Brighter, cleaner whites and subtle colors
  background: '#FFFFFF',           // Pure white instead of gray
  backgroundSecondary: '#F8FAFC',  // Very light blue-gray
  backgroundTertiary: '#EFF6FF',   // Light blue tint
  surface: '#FFFFFF',              // Pure white
  surfaceElevated: '#FFFFFF',      // Pure white with shadows
  
  // Text - Darker, higher contrast
  text: '#0F172A',                 // Almost black for maximum readability
  textSecondary: '#475569',        // Darker gray for better visibility
  textTertiary: '#64748B',         // Medium gray, still readable
  textInverse: '#FFFFFF',
  
  // Borders - More visible
  border: '#CBD5E1',               // More visible border
  borderLight: '#E2E8F0',          // Subtle but visible
  
  // Status - More vibrant colors
  primary: '#2563EB',              // Richer blue
  primaryLight: '#3B82F6',         // Bright blue
  primaryDark: '#1E40AF',          // Deep blue
  
  success: '#059669',              // Vibrant green
  successLight: '#10B981',         // Bright green
  successDark: '#047857',          // Deep green
  
  warning: '#D97706',              // Rich orange
  warningLight: '#F59E0B',         // Bright orange
  warningDark: '#B45309',          // Deep orange
  
  error: '#DC2626',                // Vivid red
  errorLight: '#EF4444',           // Bright red
  errorDark: '#B91C1C',            // Deep red
  
  // Semantic - Clean and clear
  cardBackground: '#FFFFFF',       // Pure white cards
  inputBackground: '#F8FAFC',      // Subtle background
  inputBorder: '#CBD5E1',          // Visible borders
  
  // Gradients - Soft and pleasant
  gradientStart: '#EFF6FF',        // Light blue
  gradientMiddle: '#DBEAFE',       // Sky blue
  gradientEnd: '#EFF6FF',          // Light blue
  
  // Shadow
  shadowColor: '#1E293B',          // Darker shadows for depth
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