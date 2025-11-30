// app/(tabs)/index.tsx - THEMED SCANNER SCREEN
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  analyzeContent,
  analyzeUrl,
  Icon,
  moderateScale,
  normalize,
  phishingStats,
  shadows,
  spacing,
  verticalScale,
  verticalSpacing
} from '../components/shared';

export default function ScannerScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const performScan = async (inputData: string, type = 'url') => {
    if (!inputData.trim()) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Empty Input', 'Please enter a URL or text to scan');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      let result = {
        input: inputData,
        type: type,
        timestamp: new Date().toISOString(),
        threats: [] as string[],
        riskScore: 0,
        recommendation: 'safe',
        threatLevel: 'low'
      };

      if (type === 'url') {
        const urlAnalysis = analyzeUrl(inputData);
        result = { ...result, ...urlAnalysis };
      } else {
        const contentAnalysis = analyzeContent(inputData);
        result = { ...result, ...contentAnalysis };
      }

      if (result.riskScore >= 50) {
        result.recommendation = 'block';
        result.threatLevel = 'high';
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (result.riskScore >= 25) {
        result.recommendation = 'warn';
        result.threatLevel = 'medium';
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        result.recommendation = 'safe';
        result.threatLevel = 'low';
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setScanResult(result);
      setIsScanning(false);

      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
    }, 2000);
  };

  const handleClearInput = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUrlInput('');
    setScanResult(null);
  };

  const handleClearResult = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScanResult(null);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <LinearGradient colors={[colors.gradientStart, colors.gradientMiddle, colors.gradientEnd]} style={styles.header}>
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
              <LinearGradient colors={['#EF4444', '#EC4899']} style={styles.headerIcon}>
                <Ionicons name="shield-half-sharp" size={28} color="#FFF" />
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
              onPress={handleLogout}
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <TouchableOpacity 
            style={styles.heroHeader}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('AI Scanner', `Welcome ${user?.first_name || user?.username}! Powered by advanced machine learning.`);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>AI Security Scanner</Text>
              <Text style={styles.heroSubtitle}>Advanced threat detection powered by Zero Trust</Text>
            </View>
            <View style={styles.heroIcon}>
              <Icon name="activity" size={28} color="#FFF" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Threats Blocked', `${phishingStats.threatsBlocked} threats blocked today`);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.statValue}>{phishingStats.threatsBlocked}</Text>
              <Text style={styles.statLabel}>Blocked Today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Accuracy Rate', `${phishingStats.successRate}% detection accuracy`);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.statValue}>{phishingStats.successRate}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statItem}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('URLs Scanned', `${phishingStats.urlsChecked} URLs checked today`);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.statValue}>{phishingStats.urlsChecked}</Text>
              <Text style={styles.statLabel}>Scanned</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* URL Scanner Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity 
            style={styles.cardHeader}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.9}
          >
            <LinearGradient colors={[colors.primary, '#06B6D4']} style={styles.iconGradient}>
              <Icon name="search" size={22} color="#FFF" />
            </LinearGradient>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>URL Security Scanner</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Real-time threat analysis</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.inputContainer, { 
            backgroundColor: colors.inputBackground,
            borderColor: colors.inputBorder 
          }]}>
            <Icon name="globe" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter suspicious URL to analyze..."
              value={urlInput}
              onChangeText={setUrlInput}
              placeholderTextColor={colors.textTertiary}
            />
            {urlInput.length > 0 && (
              <TouchableOpacity onPress={handleClearInput} style={styles.clearButton}>
                <Icon name="cross" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => performScan(urlInput, 'url')}
            disabled={!urlInput || isScanning}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={!urlInput || isScanning ? [colors.border, colors.borderLight] : [colors.primary, '#7C3AED']}
              style={styles.scanButton}
            >
              {isScanning ? (
                <>
                  <ActivityIndicator color="#FFF" />
                  <Text style={styles.scanButtonText}>Analyzing Security...</Text>
                </>
              ) : (
                <>
                  <Icon name="shield" size={22} color="#FFF" />
                  <Text style={styles.scanButtonText}>Scan for Threats</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Scan Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Demo Tests</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Tap any card to test detection</Text>
          <View style={styles.quickScanGrid}>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                performScan('Urgent! Your PayPal account suspended. Click here now!', 'email');
              }}
              activeOpacity={0.7}
              style={[styles.quickScanButton, { backgroundColor: isDark ? '#3F1F1F' : '#FEF2F2', borderColor: '#FCA5A5' }]}
            >
              <LinearGradient colors={['#EF4444', '#EC4899']} style={styles.quickScanIcon}>
                <Icon name="mail" size={28} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.quickScanText, { color: colors.errorDark }]}>Phishing Email</Text>
              <Text style={[styles.quickScanSubtext, { color: colors.errorLight }]}>Test suspicious content</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                performScan('paypal-security-verify.com/login', 'url');
              }}
              activeOpacity={0.7}
              style={[styles.quickScanButton, { backgroundColor: isDark ? '#3F2F1F' : '#FFFBEB', borderColor: '#FCD34D' }]}
            >
              <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.quickScanIcon}>
                <Icon name="globe" size={28} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.quickScanText, { color: colors.warningDark }]}>Fake URL</Text>
              <Text style={[styles.quickScanSubtext, { color: colors.warningLight }]}>Test malicious domain</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              performScan('https://google.com', 'url');
            }}
            activeOpacity={0.7}
            style={[styles.quickScanButton, { backgroundColor: isDark ? '#1F3F2F' : '#ECFDF5', borderColor: '#6EE7B7', width: '100%' }]}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.quickScanIcon}>
              <Icon name="check" size={28} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.quickScanText, { color: colors.successDark }]}>Safe URL Test</Text>
            <Text style={[styles.quickScanSubtext, { color: colors.successLight }]}>Test legitimate website</Text>
          </TouchableOpacity>
        </View>

        {/* Scan Result */}
        {scanResult && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={[
              styles.resultCard,
              {
                backgroundColor: scanResult.recommendation === 'block' ? (isDark ? '#3F1F1F' : '#FEE2E2') :
                               scanResult.recommendation === 'warn' ? (isDark ? '#3F2F1F' : '#FEF3C7') : 
                               (isDark ? '#1F3F2F' : '#D1FAE5'),
                borderColor: scanResult.recommendation === 'block' ? '#FCA5A5' :
                            scanResult.recommendation === 'warn' ? '#FCD34D' : '#6EE7B7'
              }
            ]}>
              <View style={styles.resultHeader}>
                <TouchableOpacity 
                  style={[
                    styles.resultIcon,
                    {
                      backgroundColor: scanResult.recommendation === 'block' ? colors.error :
                                     scanResult.recommendation === 'warn' ? colors.warning : colors.success
                    }
                  ]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={scanResult.recommendation === 'block' ? 'cross' :
                         scanResult.recommendation === 'warn' ? 'alert' : 'check'}
                    size={28}
                    color="#FFF"
                  />
                </TouchableOpacity>
                <View style={styles.resultHeaderText}>
                  <Text style={[styles.resultTitle, { color: colors.text }]}>
                    {scanResult.recommendation === 'block' ? 'THREAT DETECTED' :
                     scanResult.recommendation === 'warn' ? 'SUSPICIOUS CONTENT' :
                     'CONTENT VERIFIED SAFE'}
                  </Text>
                  <TouchableOpacity 
                    style={styles.resultMeta}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Risk Score', `Threat level: ${scanResult.riskScore}/100`);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.riskDot,
                      {
                        backgroundColor: scanResult.riskScore >= 50 ? colors.error :
                                       scanResult.riskScore >= 25 ? colors.warning : colors.success
                      }
                    ]} />
                    <Text style={[styles.resultRisk, { color: colors.textSecondary }]}>Risk: {scanResult.riskScore}/100</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  onPress={handleClearResult}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Icon name="cross" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.resultContent}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.9}
              >
                <View style={[styles.resultTarget, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)' }]}>
                  <View style={styles.resultTargetHeader}>
                    <Icon name="zap" size={14} color={colors.primary} />
                    <Text style={[styles.resultTargetTitle, { color: colors.text }]}>Analysis Target</Text>
                  </View>
                  <Text style={[styles.resultTargetText, { 
                    color: colors.text,
                    backgroundColor: colors.inputBackground 
                  }]}>{scanResult.input}</Text>
                </View>

                {scanResult.threats.length > 0 && (
                  <View style={styles.threatsSection}>
                    <View style={styles.threatsSectionHeader}>
                      <Icon name="alert" size={14} color={colors.error} />
                      <Text style={[styles.threatsSectionTitle, { color: colors.text }]}>Detected Threats</Text>
                    </View>
                    {scanResult.threats.map((threat: string, index: number) => (
                      <TouchableOpacity 
                        key={index} 
                        style={[styles.threatItem, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)' }]}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          Alert.alert('Threat Detail', threat);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.threatDot, { backgroundColor: colors.error }]} />
                        <Text style={[styles.threatText, { color: colors.text }]}>{threat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.resultAction, { backgroundColor: isDark ? colors.surface : '#1F2937' }]}
                onPress={async () => {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert('Action Taken', 'Content has been processed according to Zero Trust policy');
                }}
                activeOpacity={0.8}
              >
                <View style={styles.resultActionHeader}>
                  <Icon name="lock" size={18} color="#FFF" />
                  <Text style={styles.resultActionTitle}>Zero Trust Action</Text>
                </View>
                <Text style={styles.resultActionText}>
                  {scanResult.recommendation === 'block' ? 
                    '🚫 Access denied. Multiple threat indicators detected. Content quarantined.' :
                   scanResult.recommendation === 'warn' ?
                    '⚠️ Caution advised. Suspicious patterns found. Verify before proceeding.' :
                    '✅ All clear. No malicious indicators. Safe to proceed with caution.'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <View style={{ height: verticalScale(20) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + verticalScale(5) : verticalScale(10),
    paddingBottom: verticalScale(15),
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  headerText: {
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: normalize(12),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
    padding: spacing.lg,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? verticalScale(120) : verticalScale(100),
  },
  heroCard: {
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.xl,
    ...shadows.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalSpacing.lg,
  },
  heroTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  heroTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: verticalScale(6),
  },
  heroSubtitle: {
    fontSize: normalize(12),
    color: 'rgba(255,255,255,0.8)',
    lineHeight: normalize(16),
  },
  heroIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(14),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  statValue: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: normalize(10),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  card: {
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.xl,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.lg,
  },
  iconGradient: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  cardTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: normalize(11),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: moderateScale(14),
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'android' ? verticalScale(4) : verticalScale(8),
    marginBottom: verticalSpacing.md,
  },
  input: {
    flex: 1,
    fontSize: normalize(14),
    marginLeft: spacing.md,
    paddingVertical: verticalScale(10),
    minHeight: verticalScale(40),
  },
  clearButton: {
    padding: spacing.sm,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(14),
    ...shadows.md,
    minHeight: verticalScale(50),
  },
  scanButtonText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.md,
  },
  section: {
    marginBottom: verticalSpacing.xl,
  },
  sectionTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: normalize(11),
    textAlign: 'center',
    marginBottom: verticalSpacing.md,
    paddingHorizontal: spacing.xl,
  },
  quickScanGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickScanButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: moderateScale(16),
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
    minHeight: verticalScale(140),
    justifyContent: 'center',
  },
  quickScanIcon: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(10),
  },
  quickScanText: {
    fontSize: normalize(13),
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickScanSubtext: {
    fontSize: normalize(10),
    textAlign: 'center',
  },
  resultCard: {
    borderRadius: moderateScale(20),
    borderWidth: 2,
    padding: spacing.lg,
    marginBottom: verticalSpacing.xl,
    ...shadows.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.lg,
  },
  resultIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultHeaderText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  resultTitle: {
    fontSize: normalize(17),
    fontWeight: 'bold',
    marginBottom: 6,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskDot: {
    width: moderateScale(9),
    height: moderateScale(9),
    borderRadius: moderateScale(4.5),
    marginRight: spacing.sm,
  },
  resultRisk: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.sm,
  },
  resultContent: {
    marginBottom: verticalSpacing.md,
  },
  resultTarget: {
    borderRadius: moderateScale(14),
    padding: spacing.md,
    marginBottom: verticalSpacing.md,
  },
  resultTargetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  resultTargetTitle: {
    fontSize: normalize(13),
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  resultTargetText: {
    fontSize: normalize(12),
    padding: spacing.md,
    borderRadius: moderateScale(10),
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: normalize(16),
  },
  threatsSection: {
    marginTop: verticalSpacing.md,
  },
  threatsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  threatsSectionTitle: {
    fontSize: normalize(13),
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  threatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(8),
  },
  threatDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(3.5),
    marginRight: spacing.md,
    flexShrink: 0,
  },
  threatText: {
    fontSize: normalize(12),
    flex: 1,
    lineHeight: normalize(16),
  },
  resultAction: {
    borderRadius: moderateScale(14),
    padding: spacing.md,
  },
  resultActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  resultActionTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
  resultActionText: {
    fontSize: normalize(12),
    color: '#D1D5DB',
    lineHeight: normalize(18),
  },
});
