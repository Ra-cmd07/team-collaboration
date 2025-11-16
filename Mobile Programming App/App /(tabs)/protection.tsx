// app/(tabs)/protection.tsx - PROTECTION SCREEN
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  colors,
  Icon,
  moderateScale,
  normalize,
  phishingPatterns,
  phishingStats,
  shadows,
  spacing,
  verticalScale,
  verticalSpacing
} from '../components/shared';

export default function ProtectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#0F172A', '#1E293B', '#0F172A']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrapper}>
              <LinearGradient colors={['#EF4444', '#EC4899']} style={styles.headerIcon}>
                <Icon name="shield" size={28} color="#FFF" />
              </LinearGradient>
              <View style={styles.headerBadge} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>ZeroTrust IoT</Text>
              <Text style={styles.headerSubtitle}>AI Security Platform</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerStatus}>
              <View style={styles.headerStatusDot} />
              <Text style={styles.headerStatusText}>PROTECTED</Text>
            </View>
            <Text style={styles.headerTime}>{new Date().toLocaleTimeString()}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Protection Status */}
        <LinearGradient colors={['#059669', '#0D9488', '#06B6D4']} style={styles.protectionHeader}>
          <View style={styles.protectionHeaderContent}>
            <View style={styles.protectionTextContainer}>
              <Text style={styles.protectionTitle}>Protection Status</Text>
              <Text style={styles.protectionSubtitle}>Advanced AI security active</Text>
            </View>
            <View style={styles.protectionIcon}>
              <Icon name="shield" size={36} color="#FFF" />
            </View>
          </View>
          <View style={styles.protectionStats}>
            <View style={styles.protectionStatsColumn}>
              <View style={styles.protectionStatCard}>
                <Text style={styles.protectionStatValue}>{phishingStats.threatsBlocked}</Text>
                <Text style={styles.protectionStatLabel}>Threats Blocked Today</Text>
              </View>
              <View style={styles.protectionStatCard}>
                <Text style={styles.protectionStatValue}>{phishingStats.emailsScanned}</Text>
                <Text style={styles.protectionStatLabel}>Emails Analyzed</Text>
              </View>
            </View>
            <View style={styles.protectionStatsColumn}>
              <View style={styles.protectionStatCard}>
                <Text style={styles.protectionStatValue}>{phishingStats.urlsChecked}</Text>
                <Text style={styles.protectionStatLabel}>URLs Verified</Text>
              </View>
              <View style={styles.protectionStatCard}>
                <Text style={styles.protectionStatValue}>{phishingStats.successRate}%</Text>
                <Text style={styles.protectionStatLabel}>Detection Rate</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Real-time Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="activity" size={22} color={colors.primary.main} />
            <Text style={styles.cardTitle}>Real-time Protection</Text>
          </View>
          <View style={styles.protectionList}>
            <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.protectionItem}>
              <View style={styles.protectionItemLeft}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.protectionItemIcon}>
                  <Icon name="eye" size={22} color="#FFF" />
                </LinearGradient>
                <View style={styles.protectionItemTextContainer}>
                  <Text style={styles.protectionItemTitle}>AI Monitoring</Text>
                  <Text style={styles.protectionItemSubtitle}>Continuous threat analysis</Text>
                </View>
              </View>
              <View style={styles.protectionItemRight}>
                <View style={styles.protectionItemDot} />
                <Icon name="check" size={22} color={colors.success.main} />
              </View>
            </LinearGradient>

            <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.protectionItem}>
              <View style={styles.protectionItemLeft}>
                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.protectionItemIcon}>
                  <Icon name="lock" size={22} color="#FFF" />
                </LinearGradient>
                <View style={styles.protectionItemTextContainer}>
                  <Text style={styles.protectionItemTitle}>Zero Trust Engine</Text>
                  <Text style={styles.protectionItemSubtitle}>Never trust, always verify</Text>
                </View>
              </View>
              <View style={styles.protectionItemRight}>
                <View style={[styles.protectionItemDot, { backgroundColor: colors.primary.main }]} />
                <Icon name="check" size={22} color={colors.primary.main} />
              </View>
            </LinearGradient>

            <LinearGradient colors={['#FAF5FF', '#F3E8FF']} style={styles.protectionItem}>
              <View style={styles.protectionItemLeft}>
                <LinearGradient colors={['#A855F7', '#9333EA']} style={styles.protectionItemIcon}>
                  <Icon name="wifi" size={22} color="#FFF" />
                </LinearGradient>
                <View style={styles.protectionItemTextContainer}>
                  <Text style={styles.protectionItemTitle}>Network Analysis</Text>
                  <Text style={styles.protectionItemSubtitle}>Deep packet inspection</Text>
                </View>
              </View>
              <View style={styles.protectionItemRight}>
                <View style={[styles.protectionItemDot, { backgroundColor: '#A855F7' }]} />
                <Icon name="activity" size={22} color="#A855F7" />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Threat Intelligence */}
        <View style={styles.threatIntelCard}>
          <View style={styles.threatIntelHeader}>
            <Icon name="alert" size={22} color="#F87171" />
            <Text style={styles.threatIntelTitle}>Threat Intelligence</Text>
          </View>
          {phishingPatterns.slice(0, 4).map((pattern, index) => (
            <View key={index} style={styles.threatPattern}>
              <View style={styles.threatPatternIcon}>
                <Icon name="alert" size={14} color="#F87171" />
              </View>
              <Text style={styles.threatPatternText} numberOfLines={1}>"{pattern}"</Text>
              <View style={styles.threatPatternBadge}>
                <Text style={styles.threatPatternBadgeText}>HIGH RISK</Text>
              </View>
            </View>
          ))}
          <View style={styles.threatNetwork}>
            <View style={styles.threatNetworkHeader}>
              <Icon name="users" size={18} color="#FB923C" />
              <Text style={styles.threatNetworkTitle}>Global Threat Network</Text>
            </View>
            <Text style={styles.threatNetworkText}>
              Connected to 50,000+ security nodes worldwide for real-time threat intelligence sharing.
            </Text>
          </View>
        </View>

        {/* Security Tips */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="zap" size={22} color={colors.warning.main} />
            <Text style={styles.cardTitle}>Security Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Icon name="check" size={18} color="#FFF" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Verify Before Clicking</Text>
                <Text style={styles.tipText}>Always hover over links to preview the destination URL before clicking.</Text>
              </View>
            </LinearGradient>

            <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.tipItem}>
              <View style={[styles.tipIcon, { backgroundColor: colors.primary.main }]}>
                <Icon name="lock" size={18} color="#FFF" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Check for HTTPS</Text>
                <Text style={styles.tipText}>Legitimate sites use secure connections. Look for the lock icon in your browser.</Text>
              </View>
            </LinearGradient>

            <LinearGradient colors={['#FAF5FF', '#F3E8FF']} style={styles.tipItem}>
              <View style={[styles.tipIcon, { backgroundColor: '#A855F7' }]}>
                <Icon name="mail" size={18} color="#FFF" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Suspicious Email Signs</Text>
                <Text style={styles.tipText}>Watch for urgent language, spelling errors, and requests for personal information.</Text>
              </View>
            </LinearGradient>
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
    padding: spacing.lg,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? verticalScale(120) : verticalScale(100),
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
    padding: spacing.md,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  protectionItemDot: {
    width: moderateScale(9),
    height: moderateScale(9),
    borderRadius: moderateScale(4.5),
    backgroundColor: colors.success.main,
    marginRight: spacing.sm,
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