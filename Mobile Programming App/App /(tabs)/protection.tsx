// app/(tabs)/protection.tsx - Overhauled Interface Design
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  moderateScale,
  normalize,
  phishingPatterns,
  phishingStats,
  shadows,
  spacing,
  verticalScale,
  verticalSpacing
} from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useHistoryAnimations } from '../../hooks/useHistoryAnimations';

const CustomIcon = ({ name, size, color }: { name: string, size: number, color: string }) => {
  let iconName: keyof typeof Ionicons.glyphMap = 'shield-half-sharp';

  switch (name) {
    case 'shield': iconName = 'shield-half-sharp'; break;
    case 'cross': iconName = 'close-sharp'; break;
    case 'activity': iconName = 'pulse-sharp'; break;
    case 'eye': iconName = 'eye-sharp'; break;
    case 'lock': iconName = 'lock-closed-sharp'; break;
    case 'wifi': iconName = 'wifi-sharp'; break;
    case 'alert': iconName = 'alert-circle-sharp'; break;
    case 'users': iconName = 'people-sharp'; break;
    case 'zap': iconName = 'flash-sharp'; break;
    case 'check': iconName = 'checkmark-circle-sharp'; break;
    case 'mail': iconName = 'mail-sharp'; break;
    default: iconName = 'alert-circle-sharp';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

export default function ProtectionScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [aiMonitoring, setAiMonitoring] = useState(true);
  const [zeroTrustEngine, setZeroTrustEngine] = useState(true);
  const [networkAnalysis, setNetworkAnalysis] = useState(true);

  const {
    fadeAnim,
    slideAnim,
    scaleAnim,
    bgParticle1,
    bgParticle2,
    bgParticle3,
  } = useHistoryAnimations();

  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('🔒 Not authenticated, redirecting to login...');
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleToggle = async (setter: React.Dispatch<React.SetStateAction<boolean>>, current: boolean, name: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setter(!current);
    Alert.alert(
      name,
      `${name} has been ${!current ? 'enabled' : 'disabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handleLogout = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      console.log('🚪 Starting logout process...');

      // Call logout from auth context
      await logout();

      console.log('✅ Logout successful');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to login screen
      console.log('🔄 Redirecting to login...');
      router.replace('/login');

    } catch (error) {
      console.error('❌ Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Show loading if not authenticated
  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A1F' : '#F3F4F6' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Animated background (particles + gradient) */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={isDark ? ['#0A0A1F', '#1A0B2E', '#0A0A1F'] : ['#E5E7EB', '#E0EAFF', '#E5E7EB']}
          style={styles.gradientFill}
        />
      </View>

      <View style={styles.backgroundParticles}>
        <Animated.View style={[styles.particle, styles.particle1, {
          opacity: bgParticle1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.03, 0.08, 0.03] }),
          transform: [
            { translateY: bgParticle1.interpolate({ inputRange: [0, 1], outputRange: [0, -200] }) },
            { translateX: bgParticle1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 50, 0] }) },
          ],
        }]} />
        <Animated.View style={[styles.particle, styles.particle2, {
          opacity: bgParticle2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.04, 0.1, 0.04] }),
          transform: [
            { translateY: bgParticle2.interpolate({ inputRange: [0, 1], outputRange: [0, -250] }) },
            { translateX: bgParticle2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -60, 0] }) },
          ],
        }]} />
        <Animated.View style={[styles.particle, styles.particle3, {
          opacity: bgParticle3.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.05, 0.12, 0.05] }),
          transform: [{ translateY: bgParticle3.interpolate({ inputRange: [0, 1], outputRange: [0, -180] }) }],
        }]} />
      </View>

      {/* Header */}
      <LinearGradient colors={isDark ? ['#2D1B69', '#581C87', '#2D1B69'] : ['#EEF2FF', '#EDE9FE', '#F8FAFC']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('ZeroTrust IoT', `Logged in as: ${user?.username || 'User'}`);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.headerIconWrapper}>
              <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.headerIcon}>
                <CustomIcon name="shield" size={28} color="#FFF" />
              </LinearGradient>
              <View style={[styles.headerBadge, { backgroundColor: colors.success }]} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>ZeroTrust IoT</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>AI Security Platform</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={styles.themeToggle}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20 }}>{isDark ? "🌙" : "☀️"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Protected Status', 'All security layers active');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.headerStatus}>
                <View style={[styles.headerStatusDot, { backgroundColor: colors.success }]} />
                <Text style={styles.headerStatusText}>PROTECTED</Text>
              </View>
              <Text style={[styles.headerTime, { color: colors.textTertiary }]}>{user?.username || 'User'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info & Logout Section */}
        {user && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <View style={styles.userCard}>
              <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.userCardGradient}>
                <TouchableOpacity
                  style={styles.userCardContent}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert(
                      'Account Information',
                      `Name: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\nUsername: ${user.username}`
                    );
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {user.first_name || user.username || 'User'}
                    </Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={async (e) => {
                    // Stop event propagation
                    e?.stopPropagation?.();
                    await handleLogout();
                  }}
                  activeOpacity={0.7}
                >
                  <CustomIcon name="cross" size={18} color="#FFF" />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Animated.View>
        )}

        {/* Main Protection Status */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              Alert.alert(
                'Protection Status',
                `All systems operational\n\nThreats Blocked: ${phishingStats.threatsBlocked}\nEmails Scanned: ${phishingStats.emailsScanned}\nURLs Checked: ${phishingStats.urlsChecked}\nSuccess Rate: ${phishingStats.successRate}%`
              );
            }}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#059669', '#0D9488', '#06B6D4']} style={styles.protectionHeader}>
              <View style={styles.protectionHeaderContent}>
                <View style={styles.protectionTextContainer}>
                  <Text style={styles.protectionTitle}>Protection Status</Text>
                  <Text style={styles.protectionSubtitle}>Advanced AI security active</Text>
                </View>
                <View style={styles.protectionIcon}>
                  <CustomIcon name="shield" size={36} color="#FFF" />
                </View>
              </View>
              <View style={styles.protectionStats}>
                <View style={styles.protectionStatsColumn}>
                  <TouchableOpacity
                    style={styles.protectionStatCard}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Threats Blocked', `${phishingStats.threatsBlocked} malicious items detected and blocked`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.protectionStatValue}>{phishingStats.threatsBlocked}</Text>
                    <Text style={styles.protectionStatLabel}>Threats Blocked Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.protectionStatCard}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Emails Scanned', `${phishingStats.emailsScanned} emails analyzed for threats`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.protectionStatValue}>{phishingStats.emailsScanned}</Text>
                    <Text style={styles.protectionStatLabel}>Emails Analyzed</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.protectionStatsColumn}>
                  <TouchableOpacity
                    style={styles.protectionStatCard}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('URLs Checked', `${phishingStats.urlsChecked} URLs verified for security`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.protectionStatValue}>{phishingStats.urlsChecked}</Text>
                    <Text style={styles.protectionStatLabel}>URLs Verified</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.protectionStatCard}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Detection Rate', `${phishingStats.successRate}% accurate threat detection`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.protectionStatValue}>{phishingStats.successRate}%</Text>
                    <Text style={styles.protectionStatLabel}>Detection Rate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Real-time Status */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.25)' }]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Real-time Protection', 'All protection layers are active and monitoring');
              }}
              activeOpacity={0.8}
            >
              <CustomIcon name="activity" size={22} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Real-time Protection</Text>
            </TouchableOpacity>
            <View style={styles.protectionList}>
              {/* AI Monitoring */}
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'AI Monitoring',
                    'Continuous threat analysis using machine learning algorithms'
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['rgba(16,185,129,0.15)', 'rgba(5,150,105,0.15)'] : ['#ECFDF5', '#D1FAE5']}
                  style={styles.protectionItem}
                >
                  <View style={styles.protectionItemLeft}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.protectionItemIcon}>
                      <CustomIcon name="eye" size={22} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.protectionItemTextContainer}>
                      <Text style={[styles.protectionItemTitle, { color: colors.text }]}>AI Monitoring</Text>
                      <Text style={[styles.protectionItemSubtitle, { color: colors.textSecondary }]}>Continuous threat analysis</Text>
                    </View>
                  </View>
                  <View style={styles.protectionItemRight}>
                    <Switch
                      value={aiMonitoring}
                      onValueChange={() => handleToggle(setAiMonitoring, aiMonitoring, 'AI Monitoring')}
                      trackColor={{ false: colors.border, true: colors.successLight }}
                      thumbColor={aiMonitoring ? colors.success : colors.textTertiary}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Zero Trust Engine */}
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Zero Trust Engine',
                    'Never trust, always verify - validates every request'
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['rgba(59,130,246,0.15)', 'rgba(37,99,235,0.15)'] : ['#EFF6FF', '#DBEAFE']}
                  style={styles.protectionItem}
                >
                  <View style={styles.protectionItemLeft}>
                    <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.protectionItemIcon}>
                      <CustomIcon name="lock" size={22} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.protectionItemTextContainer}>
                      <Text style={[styles.protectionItemTitle, { color: colors.text }]}>Zero Trust Engine</Text>
                      <Text style={[styles.protectionItemSubtitle, { color: colors.textSecondary }]}>Never trust, always verify</Text>
                    </View>
                  </View>
                  <View style={styles.protectionItemRight}>
                    <Switch
                      value={zeroTrustEngine}
                      onValueChange={() => handleToggle(setZeroTrustEngine, zeroTrustEngine, 'Zero Trust Engine')}
                      trackColor={{ false: colors.border, true: colors.primaryLight }}
                      thumbColor={zeroTrustEngine ? colors.primary : colors.textTertiary}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Network Analysis */}
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Network Analysis',
                    'Deep packet inspection for network-level threats'
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['rgba(168,85,247,0.15)', 'rgba(147,51,234,0.15)'] : ['#FAF5FF', '#F3E8FF']}
                  style={styles.protectionItem}
                >
                  <View style={styles.protectionItemLeft}>
                    <LinearGradient colors={['#A855F7', '#9333EA']} style={styles.protectionItemIcon}>
                      <CustomIcon name="wifi" size={22} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.protectionItemTextContainer}>
                      <Text style={[styles.protectionItemTitle, { color: colors.text }]}>Network Analysis</Text>
                      <Text style={[styles.protectionItemSubtitle, { color: colors.textSecondary }]}>Deep packet inspection</Text>
                    </View>
                  </View>
                  <View style={styles.protectionItemRight}>
                    <Switch
                      value={networkAnalysis}
                      onValueChange={() => handleToggle(setNetworkAnalysis, networkAnalysis, 'Network Analysis')}
                      trackColor={{ false: colors.border, true: '#DDD6FE' }}
                      thumbColor={networkAnalysis ? '#A855F7' : colors.textTertiary}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Threat Intelligence */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            style={[styles.threatIntelCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surfaceElevated, borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.25)' }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Threat Intelligence', 'Real-time threat patterns detected globally');
            }}
            activeOpacity={0.9}
          >
            <View style={styles.threatIntelHeader}>
              <CustomIcon name="alert" size={22} color="#F87171" />
              <Text style={[styles.threatIntelTitle, { color: colors.text }]}>Threat Intelligence</Text>
            </View>
            {phishingPatterns.slice(0, 4).map((pattern, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.threatPattern, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.1)' }]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Threat Pattern', `"${pattern}"\n\nThis phrase is commonly used in phishing attacks`);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.threatPatternIcon}>
                  <CustomIcon name="alert" size={14} color="#F87171" />
                </View>
                <Text style={[styles.threatPatternText, { color: isDark ? colors.textSecondary : colors.text }]} numberOfLines={1}>"{pattern}"</Text>
                <View style={styles.threatPatternBadge}>
                  <Text style={styles.threatPatternBadgeText}>HIGH RISK</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.threatNetwork, { backgroundColor: isDark ? 'rgba(251,146,60,0.1)' : 'rgba(251,146,60,0.1)' }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  'Global Threat Network',
                  'Connected to 50,000+ security nodes worldwide sharing real-time intelligence'
                );
              }}
              activeOpacity={0.8}
            >
              <View style={styles.threatNetworkHeader}>
                <CustomIcon name="users" size={18} color="#FB923C" />
                <Text style={[styles.threatNetworkTitle, { color: isDark ? '#FCD34D' : '#FB923C' }]}>Global Threat Network</Text>
              </View>
              <Text style={[styles.threatNetworkText, { color: colors.textSecondary }]}>
                Connected to 50,000+ security nodes worldwide for real-time threat intelligence sharing.
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>

        {/* Security Tips */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.25)' }]}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Security Tips', 'Best practices to stay protected online');
              }}
              activeOpacity={0.8}
            >
              <CustomIcon name="zap" size={22} color={colors.warning} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Security Tips</Text>
            </TouchableOpacity>
            <View style={styles.tipsList}>
              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Verify Before Clicking',
                    'Always hover over links to preview the destination URL before clicking. Look for suspicious domains or misspellings.'
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['rgba(16,185,129,0.15)', 'rgba(5,150,105,0.15)'] : ['#ECFDF5', '#D1FAE5']}
                  style={styles.tipItem}
                >
                  <View style={[styles.tipIcon, { backgroundColor: colors.success }]}>
                    <CustomIcon name="check" size={18} color="#FFF" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Verify Before Clicking</Text>
                    <Text style={[styles.tipText, { color: colors.textSecondary }]}>Always hover over links to preview the destination URL before clicking.</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Check for HTTPS',
                    'Legitimate sites use secure connections. Look for the lock icon in your browser address bar.'
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['rgba(59,130,246,0.15)', 'rgba(37,99,235,0.15)'] : ['#EFF6FF', '#DBEAFE']}
                  style={styles.tipItem}
                >
                  <View style={[styles.tipIcon, { backgroundColor: colors.primary }]}>
                    <CustomIcon name="lock" size={18} color="#FFF" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Check for HTTPS</Text>
                    <Text style={[styles.tipText, { color: colors.textSecondary }]}>Legitimate sites use secure connections. Look for the lock icon in your browser.</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    'Suspicious Email Signs',
                    'Watch for urgent language, spelling errors, generic greetings, and requests for personal information.'
                  );
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['rgba(168,85,247,0.15)', 'rgba(147,51,234,0.15)'] : ['#FAF5FF', '#F3E8FF']}
                  style={styles.tipItem}
                >
                  <View style={[styles.tipIcon, { backgroundColor: '#A855F7' }]}>
                    <CustomIcon name="mail" size={18} color="#FFF" />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={[styles.tipTitle, { color: colors.text }]}>Suspicious Email Signs</Text>
                    <Text style={[styles.tipText, { color: colors.textSecondary }]}>Watch for urgent language, spelling errors, and requests for personal information.</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: verticalScale(20) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden'
  },
  gradientFill: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  backgroundParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#A855F7',
  },
  particle1: {
    width: 200,
    height: 200,
    top: '20%',
    left: '-10%',
    opacity: 0.05,
  },
  particle2: {
    width: 300,
    height: 300,
    top: '50%',
    right: '-15%',
    opacity: 0.07,
  },
  particle3: {
    width: 150,
    height: 150,
    top: '75%',
    left: '30%',
    opacity: 0.06,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + verticalScale(5) : verticalScale(10),
    paddingBottom: verticalScale(15),
    paddingHorizontal: spacing.lg,
    borderRadius: moderateScale(20),  
    borderWidth: 1, 
    borderColor: 'rgba(168,85,247,0.4)', 
    shadowColor: '#A855F7', 
    shadowOffset: { width: 1, height: 1 }, 
    shadowOpacity: 0.5,  
    shadowRadius: 15,  
    elevation: 8, 
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  headerIconWrapper: {
    position: 'relative',
  },
  headerIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  headerText: {
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: normalize(12),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexShrink: 0,
  },
  themeToggle: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerStatusDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(3.5),
    marginRight: spacing.xs,
    shadowColor: '#6EE7B7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  headerStatusText: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: '#6EE7B7',
  },
  headerTime: {
    fontSize: normalize(9),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? verticalScale(120) : verticalScale(100),
  },
  userCard: {
    marginBottom: verticalSpacing.lg,
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    ...shadows.lg,
    shadowColor: '#A855F7',  // ADD
    shadowOffset: { width: 0, height: 0 },  // ADD
    shadowOpacity: 0.4,  // ADD
    shadowRadius: 15,  // ADD
    elevation: 6,  // ADD
  },
  userCardGradient: {
    padding: spacing.lg,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.md,
  },
  userAvatar: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  userAvatarText: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: normalize(13),
    color: 'rgba(255,255,255,0.8)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingVertical: verticalScale(12),
    paddingHorizontal: spacing.lg,
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutButtonText: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
  protectionHeader: {
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.lg,
    ...shadows.lg,
    shadowColor: '#A855F7',  // ADD
    shadowOffset: { width: 0, height: 0 },  // ADD
    shadowOpacity: 0.4,  // ADD
    shadowRadius: 15,  // ADD
    elevation: 6,  // ADD
  },
  protectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalSpacing.lg,
  },
  protectionTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  protectionTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  protectionSubtitle: {
    fontSize: normalize(12),
    color: 'rgba(167,243,208,0.9)',
    lineHeight: normalize(16),
  },
  protectionIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  protectionStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  protectionStatsColumn: {
    flex: 1,
    gap: verticalScale(10),
  },
  protectionStatCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(14),
    padding: spacing.sm,
    alignItems: 'center',
    minHeight: verticalScale(70),
    justifyContent: 'center',
    shadowColor: '#A855F7',  // ADD
    shadowOffset: { width: 0, height: 0 },  // ADD
    shadowOpacity: 0.4,  // ADD
    shadowRadius: 15,  // ADD
    elevation: 6,  // ADD
  },
  protectionStatValue: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  protectionStatLabel: {
    fontSize: normalize(10),
    color: 'rgba(167,243,208,0.9)',
    textAlign: 'center',
  },
  card: {
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.lg,
  },
  cardTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginLeft: spacing.md,
    flexShrink: 1,
  },
  protectionList: {
    gap: verticalScale(10),
  },
  protectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: moderateScale(14),
    borderWidth: 2,
    borderColor: 'transparent',
    padding: spacing.md,
  },
  protectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  protectionItemIcon: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  protectionItemTextContainer: {
    flex: 1,
  },
  protectionItemTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    marginBottom: 2,
  },
  protectionItemSubtitle: {
    fontSize: normalize(11),
  },
  protectionItemRight: {
    marginLeft: spacing.md,
    flexShrink: 0,
  },
  threatIntelCard: {
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.25)',
    shadowColor: '#A855F7',  // ADD
    shadowOffset: { width: 0, height: 0 },  // ADD
    shadowOpacity: 0.4,  // ADD
    shadowRadius: 15,  // ADD
    elevation: 6,  // ADD
  },
  threatIntelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.md,
  },
  threatIntelTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginLeft: spacing.md,
  },
  threatPattern: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    marginBottom: verticalScale(8),
  },
  threatPatternIcon: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  threatPatternText: {
    flex: 1,
    fontSize: normalize(12),
    lineHeight: normalize(16),
  },
  threatPatternBadge: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
    flexShrink: 0,
    marginLeft: spacing.sm,
  },
  threatPatternBadgeText: {
    fontSize: normalize(9),
    fontWeight: '600',
    color: '#FCA5A5',
  },
  threatNetwork: {
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.2)',
    padding: spacing.md,
    marginTop: verticalSpacing.md,
  },
  threatNetworkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  threatNetworkTitle: {
    fontSize: normalize(13),
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  threatNetworkText: {
    fontSize: normalize(12),
    lineHeight: normalize(17),
  },
  tipsList: {
    gap: verticalScale(10),
  },
  tipItem: {
    flexDirection: 'row',
    borderRadius: moderateScale(14),
    padding: spacing.md,
    shadowColor: '#A855F7',  // ADD
    shadowOffset: { width: 0, height: 0 },  // ADD
    shadowOpacity: 0.4,  // ADD
    shadowRadius: 15,  // ADD
    elevation: 6,  // ADD
  },
  tipIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
    shadowColor: '#A855F7',  // ADD
    shadowOffset: { width: 0, height: 0 },  // ADD
    shadowOpacity: 0.4,  // ADD
    shadowRadius: 15,  // ADD
    elevation: 6,  // ADD
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    fontSize: normalize(12),
    lineHeight: normalize(17),
  },
});
