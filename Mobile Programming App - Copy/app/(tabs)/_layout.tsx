// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import {
  Icon,
  normalize,
  verticalScale
} from '../../components/shared';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const { isDark, colors: themeColors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: isDark ? themeColors.textTertiary : themeColors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? themeColors.surface : themeColors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: isDark ? themeColors.border : themeColors.borderLight,
          height: Platform.OS === 'ios' ? verticalScale(88) : verticalScale(120),
          paddingBottom: Platform.OS === 'ios' ? verticalScale(34) : verticalScale(50),
          paddingTop: verticalScale(8),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: normalize(11),
          fontWeight: '600',
          marginTop: verticalScale(4),
          textAlign: 'center',
          color: isDark ? themeColors.textSecondary : themeColors.text,
        },
        tabBarItemStyle: {
          paddingVertical: verticalScale(6),
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: verticalScale(2),
          height: verticalScale(24),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: verticalScale(28) }}>
              <Icon 
                name="search" 
                size={focused ? 24 : 22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: verticalScale(28) }}>
              <Icon 
                name="eye" 
                size={focused ? 24 : 22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="protection"
        options={{
          title: 'Protection',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: verticalScale(28) }}>
              <Icon 
                name="shield" 
                size={focused ? 24 : 22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}