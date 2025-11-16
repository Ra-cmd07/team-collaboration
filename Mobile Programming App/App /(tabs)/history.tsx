// app/(tabs)/history.tsx - INTERACTIVE HISTORY SCREEN
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  colors,
  getThreatColors,
  Icon,
  initialScans,
  moderateScale,
  normalize,
  shadows,
  spacing,
  verticalScale,
  verticalSpacing
} from '../components/shared';

export default function HistoryScreen() {
  const [recentScans, setRecentScans] = useState(initialScans);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'flagged' | 'safe'>('all');

  const handleFilterPress = async (newFilter: typeof filter) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(newFilter);
  };

  const handleScanPress = async (scan: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Scan Details',
      `URL: ${scan.url}\nType: ${scan.type}\nThreat: ${scan.threat}\nStatus: ${scan.status}\nTime: ${scan.time}`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteScan = async (scanId: number) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRecentScans(recentScans.filter(s => s.id !== scanId));
    Alert.alert('Deleted', 'Scan removed from history');
  };

  const handleClearAll = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setRecentScans([]);
          }
        }
      ]
    );
  };

  const filteredScans = filter === 'all' 
    ? recentScans 
    : recentScans.filter(s => s.status === filter);

  const blockedCount = recentScans.filter(s => s.status === 'blocked').length;
  const safeCount = recentScans.filter(s => s.status === 'safe').length;

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
              Alert.alert('ZeroTrust IoT', 'Scan History & Analytics');
            }}
            activeOpacity={0.7}
          >
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
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerRight}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Status', 'All systems protected');
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* History Header */}
        <LinearGradient colors={['#0F172A', '#581C87', '#0F172A']} style={styles.historyHeader}>
          <TouchableOpacity 
            style={styles.historyHeaderContent}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Scan History', `Total of ${recentScans.length} security scans performed`);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.historyHeaderTextContainer}>
              <Text style={styles.historyHeaderTitle}>Scan History</Text>
              <Text style={styles.historyHeaderSubtitle}>Recent security analysis</Text>
            </View>
            <View style={styles.historyHeaderIcon}>
              <Icon name="eye" size={28} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.historyHeaderMeta}>
            <TouchableOpacity 
              style={styles.liveIndicator}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Live Monitoring', 'Real-time threat detection is active');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live monitoring active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Total Scans', `${recentScans.length} scans in history`);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.historyCount}>{recentScans.length} total scans</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => handleFilterPress('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                All ({recentScans.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'blocked' && styles.filterButtonActive, { borderColor: '#FCA5A5' }]}
              onPress={() => handleFilterPress('blocked')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === 'blocked' && styles.filterTextActive]}>
                Blocked ({blockedCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'flagged' && styles.filterButtonActive, { borderColor: '#FCD34D' }]}
              onPress={() => handleFilterPress('flagged')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === 'flagged' && styles.filterTextActive]}>
                Flagged ({recentScans.filter(s => s.status === 'flagged').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'safe' && styles.filterButtonActive, { borderColor: '#6EE7B7' }]}
              onPress={() => handleFilterPress('safe')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === 'safe' && styles.filterTextActive]}>
                Safe ({safeCount})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Scan List */}
        <View style={styles.historyList}>
          {filteredScans.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="eye" size={48} color={colors.neutral.gray400} />
              <Text style={styles.emptyText}>No scans found</Text>
              <Text style={styles.emptySubtext}>Try a different filter</Text>
            </View>
          ) : (
            filteredScans.map((scan, index) => {
              const threatColors = getThreatColors(scan.threat);
              return (
                <TouchableOpacity 
                  key={scan.id} 
                  style={styles.historyItem}
                  onPress={() => handleScanPress(scan)}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    Alert.alert(
                      'Delete Scan',
                      'Remove this scan from history?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteScan(scan.id) }
                      ]
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyItemContent}>
                    <View style={[
                      styles.historyItemIcon, 
                      { backgroundColor: threatColors.bg, borderColor: threatColors.border }
                    ]}>
                      <Icon 
                        name={scan.type === 'url' ? 'globe' : scan.type === 'email' ? 'mail' : 'message'} 
                        size={18} 
                        color={threatColors.text} 
                      />
                    </View>
                    <View style={styles.historyItemText}>
                      <Text style={styles.historyItemTitle} numberOfLines={1}>{scan.url}</Text>
                      <View style={styles.historyItemMeta}>
                        <Text style={styles.historyItemType}>{scan.type} scan</Text>
                        <Text style={styles.historyItemSeparator}>•</Text>
                        <Text style={styles.historyItemTime}>{scan.time}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.historyItemRight}>
                    <View style={[
                      styles.historyItemStatus,
                      {
                        backgroundColor: scan.status === 'blocked' ? '#FEE2E2' :
                                       scan.status === 'flagged' ? '#FEF3C7' : '#D1FAE5',
                        borderColor: scan.status === 'blocked' ? '#FCA5A5' :
                                   scan.status === 'flagged' ? '#FCD34D' : '#6EE7B7'
                      }
                    ]}>
                      <Text style={[
                        styles.historyItemStatusText,
                        {
                          color: scan.status === 'blocked' ? colors.error.dark :
                                scan.status === 'flagged' ? colors.warning.dark : colors.success.dark
                        }
                      ]}>
                        {scan.status.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.historyItemRisk}>
                      <View style={[styles.historyRiskDot, { backgroundColor: threatColors.text }]} />
                      <Text style={[styles.historyItemRiskText, { color: threatColors.text }]}>
                        {scan.threat} risk
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Stats Summary */}
        {recentScans.length > 0 && (
          <TouchableOpacity 
            style={styles.historySummary}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert(
                'Analysis Summary',
                `Blocked: ${blockedCount}\nSafe: ${safeCount}\nTotal: ${recentScans.length}`
              );
            }}
            activeOpacity={0.8}
          >
            <View style={styles.historySummaryHeader}>
              <Icon name="trending" size={18} color={colors.primary.main} />
              <Text style={styles.historySummaryTitle}>Analysis Summary</Text>
            </View>
            <View style={styles.historySummaryGrid}>
              <TouchableOpacity 
                style={styles.historySummaryItem}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Threats Blocked', `${blockedCount} malicious items detected and blocked`);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.historySummaryValue, { color: colors.error.dark }]}>
                  {blockedCount}
                </Text>
                <Text style={styles.historySummaryLabel}>Threats Blocked</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.historySummaryItem}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Safe Content', `${safeCount} items verified as safe`);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.historySummaryValue, { color: colors.success.dark }]}>
                  {safeCount}
                </Text>
                <Text style={styles.historySummaryLabel}>Safe Content</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        {/* Clear History Button */}
        {recentScans.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearAll}
            activeOpacity={0.8}
          >
            <Icon name="cross" size={18} color={colors.error.main} />
            <Text style={styles.clearButtonText}>Clear All History</Text>
          </TouchableOpacity>
        )}

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
  historyHeader: {
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.lg,
  },
  historyHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalSpacing.md,
  },
  historyHeaderTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  historyHeaderTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: colors.neutral.white,
    marginBottom: 4,
  },
  historyHeaderSubtitle: {
    fontSize: normalize(12),
    color: 'rgba(196,181,253,0.8)',
  },
  historyHeaderIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(14),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(3.5),
    backgroundColor: '#6EE7B7',
    marginRight: spacing.sm,
  },
  liveText: {
    fontSize: normalize(11),
    color: 'rgba(196,181,253,0.8)',
  },
  historyCount: {
    fontSize: normalize(11),
    color: 'rgba(196,181,253,0.7)',
  },
  filterContainer: {
    marginBottom: verticalSpacing.lg,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    backgroundColor: colors.neutral.white,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: colors.neutral.gray700,
  },
  filterTextActive: {
    color: colors.neutral.white,
  },
  historyList: {
    marginBottom: verticalSpacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyText: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: colors.neutral.gray600,
    marginTop: verticalSpacing.md,
  },
  emptySubtext: {
    fontSize: normalize(12),
    color: colors.neutral.gray400,
    marginTop: verticalScale(4),
  },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: moderateScale(16),
    padding: spacing.md,
    marginBottom: verticalScale(10),
    ...shadows.sm,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  historyItemIcon: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  historyItemTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.neutral.gray900,
    marginBottom: 4,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  historyItemType: {
    fontSize: normalize(11),
    color: colors.neutral.gray500,
    textTransform: 'capitalize',
  },
  historyItemSeparator: {
    fontSize: normalize(11),
    color: colors.neutral.gray500,
    marginHorizontal: spacing.xs,
  },
  historyItemTime: {
    fontSize: normalize(11),
    color: colors.neutral.gray500,
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemStatus: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    marginBottom: verticalScale(8),
  },
  historyItemStatusText: {
    fontSize: normalize(10),
    fontWeight: '600',
  },
  historyItemRisk: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyRiskDot: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
    marginRight: spacing.xs,
  },
  historyItemRiskText: {
    fontSize: normalize(10),
    textTransform: 'capitalize',
  },
  historySummary: {
    backgroundColor: 'rgba(239,246,255,0.8)',
    borderRadius: moderateScale(20),
    borderWidth: 2,
    borderColor: '#DBEAFE',
    padding: spacing.lg,
    marginBottom: verticalSpacing.md,
  },
  historySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.md,
  },
  historySummaryTitle: {
    fontSize: normalize(15),
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginLeft: spacing.sm,
  },
  historySummaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  historySummaryItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: moderateScale(14),
    padding: spacing.md,
    alignItems: 'center',
    minHeight: verticalScale(80),
    justifyContent: 'center',
  },
  historySummaryValue: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historySummaryLabel: {
    fontSize: normalize(11),
    color: colors.neutral.gray500,
    textAlign: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: moderateScale(14),
    borderWidth: 2,
    borderColor: colors.error.light,
    padding: spacing.md,
    ...shadows.sm,
  },
  clearButtonText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.error.main,
    marginLeft: spacing.sm,
  },
});
