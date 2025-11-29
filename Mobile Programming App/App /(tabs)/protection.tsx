// app/(tabs)/protection.tsx - COMPLETE INTERACTIVE PROTECTION SCREEN WITH LOGOUT
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Dimensions, // Import Dimensions for dynamic scaling
} from 'react-native';
// FIX: Using a standard Expo icon component directly to resolve the rendering issue
import Ionicons from '@expo/vector-icons/Ionicons'; 
import { useAuth } from '../../contexts/AuthContext';
import {
  colors,
  moderateScale,
  normalize,
  phishingPatterns,
  phishingStats,
  shadows,
  spacing,
  verticalScale,
  verticalSpacing
  // FIX: Removed Icon from the shared component imports as it was causing the error
  // Assuming the rest of these imports (colors, moderateScale, etc.) are correct.
} from '../components/shared';

// Get screen dimensions for dynamic layout checks
const { height: screenHeight } = Dimensions.get('window');

// Use a calculated padding for the header to account for the notch on larger phones
const HEADER_TOP_PADDING = Platform.OS === 'android' 
  ? StatusBar.currentHeight! + verticalScale(5) 
  : verticalScale(10);
const SCROLL_BOTTOM_PADDING = screenHeight > 800 ? verticalScale(120) : verticalScale(100);

// Define a separate Icon component here using the standard library
// to replace the one that was causing the error in components/shared.
// This is the cleanest fix without modifying the shared file.
// We use a switch-case to simulate the behavior seen in the original code,
// but relying on Ionicons for the 'cross', 'shield', 'eye', 'lock', 'wifi', 'alert', 'users', 'zap', 'check', 'mail' icons.
const CustomIcon = ({ name, size, color }: { name: string, size: number, color: string }) => {
    let iconName: keyof typeof Ionicons.glyphMap | string = 'ios-alert'; // Default
    
    // Map the string names used in your original JSX to Ionicons names
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
        default: iconName = 'ios-alert';
    }

    return <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
};


export default function ProtectionScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [aiMonitoring, setAiMonitoring] = useState(true);
  const [zeroTrustEngine, setZeroTrustEngine] = useState(true);
  const [networkAnalysis, setNetworkAnalysis] = useState(true);

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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.headerLeft}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('ZeroTrust IoT', 'Advanced Protection System');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.headerIconWrapper}>
              <LinearGradient colors={['#EF4444', '#EC4899']} style={styles.headerIcon}>
                <CustomIcon name="shield" size={28} color="#FFF" />
              </LinearGradient>
              <View style={styles.headerBadge} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>ZeroTrust IoT</Text>
              <Text style={styles.headerSubtitle}>AI Security Platform</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerRight}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Protected Status', 'All security layers active');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.headerStatus}>
              <View style={styles.headerStatusDot} />
              <Text style={styles.headerStatusText}>PROTECTED</Text>
            </View>
            <Text style={styles.headerTime}>{new Date().toLocaleTimeString()}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Content Area */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: SCROLL_BOTTOM_PADDING }]}
      >
        {/* User Info & Logout Section */}
        {user && (
          <TouchableOpacity
            style={styles.userCard}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert(
                'Account Information',
                `Name: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\nUsername: ${user.username}`
              );
            }}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.userCardGradient}>
              <View style={styles.userCardContent}>
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
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                {/* LINE FIXED: Changed to use CustomIcon */}
                <CustomIcon name="cross" size={18} color="#FFF" /> 
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Main Protection Status */}
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

        {/* Real-time Status */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.cardHeader}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Real-time Protection', 'All protection layers are active and monitoring');
            }}
            activeOpacity={0.8}
          >
            <CustomIcon name="activity" size={22} color={colors.primary.main} />
            <Text style={styles.cardTitle}>Real-time Protection</Text>
          </TouchableOpacity>
          <View style={styles.protectionList}>
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
              <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.protectionItem}>
                <View style={styles.protectionItemLeft}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.protectionItemIcon}>
                    <CustomIcon name="eye" size={22} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.protectionItemTextContainer}>
                    <Text style={styles.protectionItemTitle}>AI Monitoring</Text>
                    <Text style={styles.protectionItemSubtitle}>Continuous threat analysis</Text>
                  </View>
                </View>
                <View style={styles.protectionItemRight}>
                  <Switch
                    value={aiMonitoring}
                    onValueChange={() => handleToggle(setAiMonitoring, aiMonitoring, 'AI Monitoring')}
                    trackColor={{ false: colors.neutral.gray300, true: colors.success.light }}
                    thumbColor={aiMonitoring ? colors.success.main : colors.neutral.gray400}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

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
              <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.protectionItem}>
                <View style={styles.protectionItemLeft}>
                  <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.protectionItemIcon}>
                    <CustomIcon name="lock" size={22} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.protectionItemTextContainer}>
                    <Text style={styles.protectionItemTitle}>Zero Trust Engine</Text>
                    <Text style={styles.protectionItemSubtitle}>Never trust, always verify</Text>
                  </View>
                </View>
                <View style={styles.protectionItemRight}>
                  <Switch
                    value={zeroTrustEngine}
                    onValueChange={() => handleToggle(setZeroTrustEngine, zeroTrustEngine, 'Zero Trust Engine')}
                    trackColor={{ false: colors.neutral.gray300, true: colors.primary.light }}
                    thumbColor={zeroTrustEngine ? colors.primary.main : colors.neutral.gray400}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

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
              <LinearGradient colors={['#FAF5FF', '#F3E8FF']} style={styles.protectionItem}>
                <View style={styles.protectionItemLeft}>
                  <LinearGradient colors={['#A855F7', '#9333EA']} style={styles.protectionItemIcon}>
                    <CustomIcon name="wifi" size={22} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.protectionItemTextContainer}>
                    <Text style={styles.protectionItemTitle}>Network Analysis</Text>
                    <Text style={styles.protectionItemSubtitle}>Deep packet inspection</Text>
                  </View>
                </View>
                <View style={styles.protectionItemRight}>
                  <Switch
                    value={networkAnalysis}
                    onValueChange={() => handleToggle(setNetworkAnalysis, networkAnalysis, 'Network Analysis')}
                    trackColor={{ false: colors.neutral.gray300, true: '#DDD6FE' }}
                    thumbColor={networkAnalysis ? '#A855F7' : colors.neutral.gray400}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Threat Intelligence */}
        <TouchableOpacity 
          style={styles.threatIntelCard}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Threat Intelligence', 'Real-time threat patterns detected globally');
          }}
          activeOpacity={0.9}
        >
          <View style={styles.threatIntelHeader}>
            <CustomIcon name="alert" size={22} color="#F87171" />
            <Text style={styles.threatIntelTitle}>Threat Intelligence</Text>
          </View>
          {phishingPatterns.slice(0, 4).map((pattern, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.threatPattern}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Threat Pattern', `"${pattern}"\n\nThis phrase is commonly used in phishing attacks`);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.threatPatternIcon}>
                <CustomIcon name="alert" size={14} color="#F87171" />
              </View>
              <Text style={styles.threatPatternText} numberOfLines={1}>"{pattern}"</Text>
              <View style={styles.threatPatternBadge}>
                <Text style={styles.threatPatternBadgeText}>HIGH RISK</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.threatNetwork}
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
              <Text style={styles.threatNetworkTitle}>Global Threat Network</Text>
            </View>
            <Text style={styles.threatNetworkText}>
              Connected to 50,000+ security nodes worldwide for real-time threat intelligence sharing.
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Security Tips */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.cardHeader}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Security Tips', 'Best practices to stay protected online');
            }}
            activeOpacity={0.8}
          >
            <CustomIcon name="zap" size={22} color={colors.warning.main} />
            <Text style={styles.cardTitle}>Security Tips</Text>
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
              <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.tipItem}>
                <View style={styles.tipIcon}>
                  <CustomIcon name="check" size={18} color="#FFF" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Verify Before Clicking</Text>
                  <Text style={styles.tipText}>Always hover over links to preview the destination URL before clicking.</Text>
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
              <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: colors.primary.main }]}>
                  <CustomIcon name="lock" size={18} color="#FFF" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Check for HTTPS</Text>
                  <Text style={styles.tipText}>Legitimate sites use secure connections. Look for the lock icon in your browser.</Text>
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
              <LinearGradient colors={['#FAF5FF', '#F3E8FF']} style={styles.tipItem}>
                <View style={[styles.tipIcon, { backgroundColor: '#A855F7' }]}>
                  <CustomIcon name="mail" size={18} color="#FFF" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Suspicious Email Signs</Text>
                  <Text style={styles.tipText}>Watch for urgent language, spelling errors, and requests for personal information.</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: verticalScale(20) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.gray100,
  },
  header: {
    paddingTop: HEADER_TOP_PADDING, 
    paddingBottom: verticalScale(15),
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
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
  },
  headerBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: colors.success.main,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  headerText: {
    marginLeft: spacing.md,
    flexShrink: 1, 
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: colors.neutral.white,
  },
  headerSubtitle: {
    fontSize: normalize(12),
    color: colors.neutral.gray300,
  },
  headerRight: {
    alignItems: 'flex-end',
    flexShrink: 0, 
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
    backgroundColor: colors.success.main,
    marginRight: spacing.xs,
  },
  headerStatusText: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: '#6EE7B7',
  },
  headerTime: {
    fontSize: normalize(9),
    color: colors.neutral.gray400,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingTop: spacing.lg, 
  },
  userCard: {
    marginBottom: verticalSpacing.lg,
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    ...shadows.lg,
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
    color: colors.neutral.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: colors.neutral.white,
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
    color: colors.neutral.white,
    marginLeft: spacing.sm,
  },
  protectionHeader: {
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.lg,
    ...shadows.lg,
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
    color: colors.neutral.white,
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
  },
  protectionStatValue: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: colors.neutral.white,
    marginBottom: 4,
  },
  protectionStatLabel: {
    fontSize: normalize(10),
    color: 'rgba(167,243,208,0.9)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    color: colors.neutral.gray900,
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
    color: colors.neutral.gray900,
    marginBottom: 2,
  },
  protectionItemSubtitle: {
    fontSize: normalize(11),
    color: colors.neutral.gray500,
  },
  protectionItemRight: {
    marginLeft: spacing.md,
    flexShrink: 0,
  },
  threatIntelCard: {
    backgroundColor: colors.neutral.gray800,
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.lg,
  },
  threatIntelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.md,
  },
  threatIntelTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: colors.neutral.white,
    marginLeft: spacing.md,
  },
  threatPattern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: colors.neutral.gray200,
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
    backgroundColor: 'rgba(251,146,60,0.1)',
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
    color: '#FB923C',
    marginLeft: spacing.sm,
  },
  threatNetworkText: {
    fontSize: normalize(12),
    color: colors.neutral.gray300,
    lineHeight: normalize(17),
  },
  tipsList: {
    gap: verticalScale(10),
  },
  tipItem: {
    flexDirection: 'row',
    borderRadius: moderateScale(14),
    padding: spacing.md,
  },
  tipIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    backgroundColor: colors.success.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 4,
  },
  tipText: {
    fontSize: normalize(12),
    color: colors.neutral.gray500,
    lineHeight: normalize(17),
  },
});
