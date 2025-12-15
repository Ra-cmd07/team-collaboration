// app/index.tsx - FIXED VERSION
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Wait for component to mount
  useEffect(() => {
    // Small delay to ensure navigation is ready
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading while auth is checking or component isn't mounted
  if (isLoading || !isMounted) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#0F172A' 
      }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Navigate based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}