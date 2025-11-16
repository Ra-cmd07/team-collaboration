// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import {
  colors,
  Icon,
  normalize,
  verticalScale
} from '../components/shared';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.gray400,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: colors.neutral.gray200,
          height: Platform.OS === 'ios' ? verticalScale(88) : verticalScale(70),
          paddingBottom: Platform.OS === 'ios' ? verticalScale(34) : verticalScale(8),
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