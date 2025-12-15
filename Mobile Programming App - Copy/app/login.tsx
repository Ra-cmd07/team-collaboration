// app/login.tsx - LOGIN SCREEN WITH MATCHING SHIELD ICON
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  colors,
  Icon
} from '../components/shared';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [focusedInput, setFocusedInput] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!username || !password) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Please enter ID number and password');
      return;
    }

    setError('');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login...');
      console.log('📋 ID Number:', username);
      console.log('🌐 API: https://citc-ustpcdo.com/api/v1/');
      
      // Call the auth context login function with real API
      await login(username, password);
      
      console.log('✅ Login successful!');
      console.log('🎉 Authenticated! Redirecting to dashboard...');

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Login Successful',
        `Welcome back! You're now logged in.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]
      );

    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('🚨 Login Error:', errorMessage);
      
      setError(errorMessage);
      
      // Show user-friendly error
      let displayMessage = errorMessage;
      if (errorMessage.includes('Invalid')) {
        displayMessage = 'Invalid ID number or password. Please try again.';
      } else if (errorMessage.includes('Network') || errorMessage.includes('timeout')) {
        displayMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      Alert.alert('Login Failed', displayMessage, [{ text: 'Try Again' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e3a8a', '#0f172a']}
        style={styles.gradient}
      >
        {/* Animated Background Circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo Section - UPDATED WITH MATCHING SHIELD */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#A855F7', '#EC4899']}
                style={styles.logoGradient}
              >
                <Ionicons name="shield-half-sharp" size={36} color="#FFF" />
              </LinearGradient>
              <Text style={styles.title}>ZeroTrust</Text>
              <Text style={styles.subtitle}>AI Security Platform</Text>
            </View>

            {/* Main Card with Blur */}
            <BlurView intensity={80} tint="light" style={styles.card}>
              <View style={styles.cardContent}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.welcomeText}>Welcome Back</Text>
                  <Text style={styles.description}>
                    Sign in with your citc-ustpcdo.com
                  </Text>
                </View>

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorBox}>
                    <Icon name="alert" size={14} color={colors.error.main} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* ID Number Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>ID Number</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'username' && styles.inputWrapperFocused,
                      error && styles.inputWrapperError,
                    ]}
                  >
                    <Icon name="users" size={18} color="#3b82f6" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your ID number (e.g., 2023302988)"
                      placeholderTextColor="#94a3b8"
                      value={username}
                      onChangeText={(text) => {
                        setUsername(text);
                        setError('');
                      }}
                      onFocus={() => setFocusedInput('username')}
                      onBlur={() => setFocusedInput('')}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      returnKeyType="next"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedInput === 'password' && styles.inputWrapperFocused,
                      error && styles.inputWrapperError,
                    ]}
                  >
                    <Icon name="lock" size={18} color="#3b82f6" />
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Enter your password"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setError('');
                      }}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput('')}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      returnKeyType="go"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      disabled={isLoading}
                    >
                      <Icon 
                        name={showPassword ? 'eye' : 'lock'} 
                        size={18} 
                        color="#94a3b8" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Network Status Info */}
                <View style={styles.networkInfo}>
                  <View style={styles.networkDot} />
                  <Text style={styles.networkText}>
                    Connected to citc-ustpcdo.com
                  </Text>
                </View>

                {/* Sign In Button - UPDATED WITH SHIELD ICON */}
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={handleLogin}
                  disabled={isLoading || !username || !password}
                >
                  <LinearGradient
                    colors={
                      isLoading || !username || !password
                        ? ['#cbd5e1', '#94a3b8']
                        : ['#2563eb', '#1d4ed8']
                    }
                    style={styles.signInButton}
                  >
                    {isLoading ? (
                      <>
                        <ActivityIndicator color="white" size="small" />
                        <Text style={styles.signInButtonText}>Authenticating...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="shield-half-sharp" size={18} color="white" />
                        <Text style={styles.signInButtonText}>Sign In Securely</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* API Info */}
                <View style={styles.apiInfo}>
                  <Text style={styles.apiInfoText}>
                    🔒 Secure connection to citc-ustpcdo.com
                  </Text>
                </View>
              </View>
            </BlurView>

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Icon name="check" size={14} color="#4ade80" />
              <Text style={styles.securityText}>256-bit Encrypted Connection</Text>
            </View>

            {/* Development Test Button */}
            {__DEV__ && (
              <View style={styles.devSection}>
                <TouchableOpacity
                  style={styles.testDevButton}
                  onPress={() => {
                    setUsername('2023302988');
                    setPassword('');
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert(
                      'Test Mode',
                      'ID number filled. Enter your password to test the real API connection.\n\nOpen DevTools Network tab to see:\n• POST /auth/token/login/\n• GET /auth/users/me/'
                    );
                  }}
                >
                  <Text style={styles.testDevButtonText}>🔧 Fill Test ID Number</Text>
                </TouchableOpacity>
                
                <Text style={styles.devNote}>
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  circle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.1,
  },
  circle1: {
    backgroundColor: '#3b82f6',
    top: '25%',
    left: '25%',
  },
  circle2: {
    backgroundColor: '#ec4899',
    bottom: '25%',
    right: '25%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#bfdbfe',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#64748b',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorText: {
    fontSize: 12,
    color: '#991b1b',
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: '#3b82f6',
    backgroundColor: 'white',
  },
  inputWrapperError: {
    borderColor: '#dc2626',
    backgroundColor: '#fff5f5',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1e293b',
    paddingHorizontal: 8,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  networkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  networkText: {
    fontSize: 11,
    color: '#64748b',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  apiInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  apiInfoText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 16,
  },
  securityText: {
    fontSize: 11,
    color: '#bfdbfe',
    fontWeight: '500',
  },
  devSection: {
    marginTop: 16,
    gap: 12,
  },
  testDevButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  testDevButtonText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
  },
  devNote: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});