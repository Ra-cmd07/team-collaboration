// app/(tabs)/history.tsx - COMPREHENSIVE HISTORY SCREEN WITH ADVANCED FEATURES
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getThreatColors,
  Icon,
  initialScans,
  moderateScale,
  normalize,
  ScanResult,
  shadows,
  spacing,
  verticalScale,
  verticalSpacing,
} from '../components/shared';

// Type definitions
interface ScanResult {
  id: string | number;
  url: string;
  type: string;
  threat: string;
  status: string;
  time: string;
}

interface GroupedScans {
  today: ScanResult[];
  yesterday: ScanResult[];
  thisWeek: ScanResult[];
  older: ScanResult[];
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [scans, setScans] = useState<ScanResult[]>(initialScans);
  const [loading, setLoading] = useState(false);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'flagged' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status' | 'threat'>('date');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Refresh function
  const onRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  // Delete individual scan
  const deleteScan = async (scanId: string | number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setScans(scans.filter(scan => scan.id !== scanId));
          },
        },
      ]
    );
  };

  // Clear all scans
  const clearAllScans = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all scan history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setScans([]);
            setSearchQuery('');
          },
        },
      ]
    );
  };

  // View scan details
  const viewScanDetails = async (scan: ScanResult) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedScan(scan);
    setModalVisible(true);
  };

  // Search and filter scans
  const getFilteredScans = () => {
    let filtered = scans;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(scan => scan.status === filter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(scan =>
        scan.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.url.localeCompare(b.url);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'threat':
          const threatOrder: { [key: string]: number } = { high: 3, medium: 2, low: 1 };
          return (threatOrder[b.threat] || 0) - (threatOrder[a.threat] || 0);
        case 'date':
        default:
          const getMinutes = (timeStr: string) => {
            if (timeStr.includes('min ago')) return parseInt(timeStr) || 0;
            if (timeStr.includes('hour ago') || timeStr.includes('hours ago')) return (parseInt(timeStr) || 0) * 60;
            return 999999;
          };
          return getMinutes(a.time) - getMinutes(b.time);
      }
    });

    return sorted;
  };

  // Group scans by date
  const getGroupedScans = (): GroupedScans => {
    const filtered = getFilteredScans();
    const grouped: GroupedScans = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    const weekAgo = new Date(now.getTime() - 604800000);

    filtered.forEach(scan => {
      const timeStr = scan.time;
      let scanDate = new Date();

      if (timeStr.includes('min ago')) {
        const mins = parseInt(timeStr) || 0;
        scanDate = new Date(scanDate.getTime() - mins * 60000);
      } else if (timeStr.includes('hour ago') || timeStr.includes('hours ago')) {
        const hours = parseInt(timeStr) || 0;
        scanDate = new Date(scanDate.getTime() - hours * 3600000);
      }

      const scanDateStr = scanDate.toDateString();

      if (scanDateStr === today) {
        grouped.today.push(scan);
      } else if (scanDateStr === yesterday) {
        grouped.yesterday.push(scan);
      } else if (scanDate >= weekAgo) {
        grouped.thisWeek.push(scan);
      } else {
        grouped.older.push(scan);
      }
    });

    return grouped;
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      const csvHeader = 'ID,URL,Type,Threat Level,Status,Time\n';
      const csvRows = scans.map(scan =>
        `${scan.id},"${scan.url}",${scan.type},${scan.threat},${scan.status},${scan.time}`
      ).join('\n');

      const csvContent = csvHeader + csvRows;
      
      await Share.share({
        message: csvContent,
        title: 'Scan History CSV'
      });
      setExportModalVisible(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export scan history');
    }
  };

  // Export to JSON
  const exportToJSON = async () => {
    try {
      const jsonContent = JSON.stringify(scans, null, 2);
      
      await Share.share({
        message: jsonContent,
        title: 'Scan History JSON'
      });
      setExportModalVisible(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export scan history');
    }
  };

  // Share as text
  const shareAsText = async () => {
    try {
      const textContent = scans.map(scan =>
        `${scan.url} - ${scan.type} scan - ${scan.threat} risk - ${scan.status} - ${scan.time}`
      ).join('\n\n');

      await Share.share({
        message: `ZeroTrust IoT Scan History\n\n${textContent}`,
        title: 'Scan History'
      });
      setExportModalVisible(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Share Error', 'Failed to share scan history');
    }
  };

  const groupedScans = getGroupedScans();
  const filteredScans = getFilteredScans();
  const blockedCount = scans.filter(s => s.status === 'blocked').length;
  const safeCount = scans.filter(s => s.status === 'safe').length;

  // Render delete button for swipe
  const renderRightActions = (scanId: string | number) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteScan(scanId)}
    >
      <Text style={styles.deleteButtonIcon}>🗑️</Text>
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  // Render grouped section
  const renderGroupSection = (title: string, scanList: ScanResult[]) => {
    if (scanList.length === 0) return null;

    return (
      <View key={title} style={styles.groupSection}>
        <Text style={styles.groupTitle}>{title}</Text>
        {scanList.map((scan) => {
          const threatColors = getThreatColors(scan.threat);
          return (
            <Swipeable
              key={scan.id}
              renderRightActions={() => renderRightActions(scan.id)}
              overshootRight={false}
            >
              <TouchableOpacity
                style={[styles.historyItem, { backgroundColor: colors.cardBackground || '#FFFFFF' }]}
                onPress={() => viewScanDetails(scan)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  Alert.alert(
                    'Delete Scan',
                    'Remove this scan from history?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteScan(scan.id) }
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={styles.historyItemContent}>
                  <View style={[
                    styles.historyItemIcon, 
                    { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : threatColors.bg, borderColor: threatColors.border }
                  ]}>
                    <Icon 
                      name={scan.type === 'url' ? 'globe' : scan.type === 'email' ? 'mail' : 'message'} 
                      size={18} 
                      color={threatColors.text} 
                    />
                  </View>
                  <View style={styles.historyItemText}>
                    <Text style={[styles.historyItemTitle, { color: colors.text }]} numberOfLines={1}>{scan.url}</Text>
                    <View style={styles.historyItemMeta}>
                      <Text style={[styles.historyItemType, { color: colors.textSecondary }]}>{scan.type} scan</Text>
                      <Text style={[styles.historyItemSeparator, { color: colors.textSecondary }]}>•</Text>
                      <Text style={[styles.historyItemTime, { color: colors.textSecondary }]}>{scan.time}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.historyItemRight}>
                  <View style={[
                    styles.historyItemStatus,
                    {
                      backgroundColor: scan.status === 'blocked' ? (isDark ? 'rgba(239,68,68,0.2)' : '#FEE2E2') :
                                     scan.status === 'flagged' ? (isDark ? 'rgba(245,158,11,0.2)' : '#FEF3C7') : 
                                     (isDark ? 'rgba(16,185,129,0.2)' : '#D1FAE5'),
                      borderColor: scan.status === 'blocked' ? '#FCA5A5' :
                                 scan.status === 'flagged' ? '#FCD34D' : '#6EE7B7'
                    }
                  ]}>
                    <Text style={[
                      styles.historyItemStatusText,
                      {
                        color: scan.status === 'blocked' ? '#DC2626' :
                              scan.status === 'flagged' ? '#D97706' : '#059669'
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
            </Swipeable>
          );
        })}
      </View>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <LinearGradient colors={[colors.gradientStart || '#0F172A', colors.gradientMiddle || '#1E293B', colors.gradientEnd || '#0F172A']} style={styles.header}>
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* History Header */}
        <LinearGradient colors={isDark ? ['#1E293B', '#581C87', '#1E293B'] : ['#0F172A', '#581C87', '#0F172A']} style={styles.historyHeader}>
          <TouchableOpacity 
            style={styles.historyHeaderContent}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Scan History', `Total of ${scans.length} security scans performed by ${user?.username}`);
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
          </View>
          <View style={styles.historyHeaderMeta}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live monitoring active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Total Scans', `${scans.length} scans in history`);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.historyCount}>{scans.length} total scans</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search scans..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, loading && styles.actionButtonLoading]}
            onPress={onRefresh}
            disabled={loading}
          >
            <Text style={styles.actionButtonIcon}>{loading ? '⏳' : '🔄'}</Text>
            <Text style={styles.actionButtonText}>{loading ? 'Loading...' : 'Refresh'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setExportModalVisible(true)}
            disabled={scans.length === 0}
          >
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['all', 'blocked', 'flagged', 'safe'] as const).map((filterOption) => (
              <TouchableOpacity
                key={filterOption}
                style={[
                  styles.filterButton,
                  { 
                    backgroundColor: filter === filterOption ? colors.primary : colors.surface,
                    borderColor: filter === filterOption ? colors.primary : colors.border
                  }
                ]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFilter(filterOption);
                }}
              >
                <Text style={[styles.filterText, { color: filter === filterOption ? colors.textInverse : colors.text }]}>
                  {filterOption === 'all' ? `All (${scans.length})` :
                   filterOption === 'blocked' ? `Blocked (${scans.filter(s => s.status === 'blocked').length})` :
                   filterOption === 'flagged' ? `Flagged (${scans.filter(s => s.status === 'flagged').length})` :
                   `Safe (${scans.filter(s => s.status === 'safe').length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {scans.length > 0 && (
            <>
              <TouchableOpacity
                style={[styles.sortButton, { borderColor: colors.primary }]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortModalVisible(true);
                }}
              >
                <Text style={styles.sortIcon}>⇅</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearAllButton} onPress={clearAllScans}>
                <Text style={styles.clearAllIcon}>✕</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>

        {/* Grouped Scan List */}
        {filteredScans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No scans found</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {searchQuery ? 'No scans match your search' :
                filter === 'all'
                  ? 'Tap refresh or start scanning to see results here'
                  : `No ${filter} scans in your history`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {renderGroupSection('Today', groupedScans.today)}
            {renderGroupSection('Yesterday', groupedScans.yesterday)}
            {renderGroupSection('This Week', groupedScans.thisWeek)}
            {renderGroupSection('Older', groupedScans.older)}
          </View>
        )}

        {/* Stats Summary */}
        {scans.length > 0 && (
          <TouchableOpacity 
            style={[styles.historySummary, { 
              backgroundColor: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(239,246,255,0.8)',
              borderColor: isDark ? colors.border : '#DBEAFE'
            }]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert(
                'Analysis Summary',
                `Blocked: ${blockedCount}\nSafe: ${safeCount}\nTotal: ${scans.length}`
              );
            }}
            activeOpacity={0.8}
          >
            <View style={styles.historySummaryHeader}>
              <Icon name="trending" size={18} color={colors.primary} />
              <Text style={[styles.historySummaryTitle, { color: colors.text }]}>Analysis Summary</Text>
            </View>
            <View style={styles.historySummaryGrid}>
              <TouchableOpacity 
                style={[styles.historySummaryItem, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)' }]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Threats Blocked', `${blockedCount} malicious items detected and blocked`);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.historySummaryValue, { color: '#DC2626' }]}>
                  {blockedCount}
                </Text>
                <Text style={[styles.historySummaryLabel, { color: colors.textSecondary }]}>Threats Blocked</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.historySummaryItem, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.7)' }]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Safe Content', `${safeCount} items verified as safe`);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.historySummaryValue, { color: '#059669' }]}>
                  {safeCount}
                </Text>
                <Text style={[styles.historySummaryLabel, { color: colors.textSecondary }]}>Safe Content</Text>
              </TouchableOpacity>

        <View style={{ height: verticalScale(20) }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {selectedScan && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Scan Details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>URL</Text>
                    <Text style={[styles.modalValue, { color: colors.text }]}>{selectedScan.url}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Scan Type</Text>
                    <Text style={[styles.modalValue, { color: colors.text }]}>{selectedScan.type}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Threat Level</Text>
                    <View style={styles.modalThreatContainer}>
                      <View style={[
                        styles.modalThreatBadge,
                        { 
                          backgroundColor: selectedScan.threat === 'high' ? '#FCA5A5' : 
                                         selectedScan.threat === 'medium' ? '#FCD34D' : '#6EE7B7'
                        }
                      ]}>
                        <Text style={[styles.modalThreatText, { 
                          color: selectedScan.threat === 'high' ? '#DC2626' : 
                                selectedScan.threat === 'medium' ? '#D97706' : '#059669'
                        }]}>
                          {selectedScan.threat.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Status</Text>
                    <View style={[
                      styles.modalStatusBadge,
                      {
                        backgroundColor: selectedScan.status === 'blocked' ? '#FEE2E2' :
                                       selectedScan.status === 'flagged' ? '#FEF3C7' : '#D1FAE5'
                      }
                    ]}>
                      <Text style={[styles.modalStatusText, {
                        color: selectedScan.status === 'blocked' ? '#DC2626' :
                              selectedScan.status === 'flagged' ? '#D97706' : '#059669'
                      }]}>
                        {selectedScan.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Scan Time</Text>
                    <Text style={[styles.modalValue, { color: colors.text }]}>{selectedScan.time}</Text>
                  </View>

                  <View style={[styles.modalRecommendations, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F3F4F6' }]}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary, marginBottom: 8 }]}>Recommendations</Text>
                    <Text style={[styles.modalRecommendationItem, { color: colors.text }]}>
                      • Monitor this {selectedScan.type} regularly
                    </Text>
                    <Text style={[styles.modalRecommendationItem, { color: colors.text }]}>
                      • Review access logs for suspicious activity
                    </Text>
                    <Text style={[styles.modalRecommendationItem, { color: colors.text }]}>
                      • Update security policies if needed
                    </Text>
                  </View>
                </ScrollView>

                <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.modalDeleteButton}
                    onPress={() => {
                      deleteScan(selectedScan.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.modalDeleteIcon}>🗑️</Text>
                    <Text style={styles.modalDeleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalCloseButton, { backgroundColor: colors.surface }]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={[styles.modalCloseButtonText, { color: colors.text }]}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.exportModalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Export History</Text>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.exportOptions}>
              <TouchableOpacity style={styles.exportOption} onPress={exportToCSV}>
                <Text style={styles.exportOptionIcon}>📊</Text>
                <View style={styles.exportOptionText}>
                  <Text style={[styles.exportOptionTitle, { color: colors.text }]}>Export as CSV</Text>
                  <Text style={[styles.exportOptionDesc, { color: colors.textSecondary }]}>Compatible with spreadsheet apps</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportOption} onPress={exportToJSON}>
                <Text style={styles.exportOptionIcon}>📄</Text>
                <View style={styles.exportOptionText}>
                  <Text style={[styles.exportOptionTitle, { color: colors.text }]}>Export as JSON</Text>
                  <Text style={[styles.exportOptionDesc, { color: colors.textSecondary }]}>Full data backup format</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportOption} onPress={shareAsText}>
                <Text style={styles.exportOptionIcon}>📱</Text>
                <View style={styles.exportOptionText}>
                  <Text style={[styles.exportOptionTitle, { color: colors.text }]}>Share as Text</Text>
                  <Text style={[styles.exportOptionDesc, { color: colors.textSecondary }]}>Send via messaging apps</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.exportCancelButton, { backgroundColor: colors.surface }]}
              onPress={() => setExportModalVisible(false)}
            >
              <Text style={[styles.exportCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.exportModalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sort By</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.exportOptions}>
              {(['date', 'name', 'status', 'threat'] as const).map((option) => (
                <TouchableOpacity 
                  key={option}
                  style={[
                    styles.exportOption,
                    sortBy === option && styles.exportOptionActive
                  ]}
                  onPress={() => {
                    setSortBy(option);
                    setSortModalVisible(false);
                  }}
                >
                  <Text style={styles.exportOptionIcon}>
                    {option === 'date' ? '🕐' : option === 'name' ? '📝' : option === 'status' ? '🏷️' : '⚠️'}
                  </Text>
                  <View style={styles.exportOptionText}>
                    <Text style={[styles.exportOptionTitle, { color: colors.text }]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                    <Text style={[styles.exportOptionDesc, { color: colors.textSecondary }]}>
                      Sort by {option}
                    </Text>
                  </View>
                  {sortBy === option && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.exportCancelButton, { backgroundColor: colors.surface }]}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={[styles.exportCancelText, { color: colors.text }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  historyHeader: {
    borderRadius: moderateScale(20),
    padding: spacing.lg,
    marginBottom: verticalSpacing.md,
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
    color: '#FFFFFF',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(14),
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(10),
    marginBottom: verticalSpacing.md,
    ...shadows.sm,
  },
  searchIcon: {
    fontSize: normalize(16),
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: normalize(14),
  },
  searchClear: {
    fontSize: normalize(18),
    color: '#9CA3AF',
    fontWeight: 'bold',
    paddingLeft: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: verticalSpacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(12),
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  actionButtonLoading: {
    opacity: 0.6,
  },
  actionButtonIcon: {
    fontSize: normalize(18),
    marginRight: spacing.sm,
  },
  actionButtonText: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: '#3B82F6',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.md,
  },
  filterScroll: {
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  sortButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sortIcon: {
    fontSize: normalize(20),
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  clearAllButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  clearAllIcon: {
    fontSize: normalize(18),
  },
  clearAllButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  clearAllIcon: {
    fontSize: normalize(18),
  },
  sortButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 2,
    borderColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sortIcon: {
    fontSize: normalize(20),
    color: colors.primary.main,
    fontWeight: 'bold',
  },
  historyList: {
    marginBottom: verticalSpacing.lg,
  },
  groupSection: {
    marginBottom: verticalSpacing.lg,
  },
  groupTitle: {
    fontSize: normalize(13),
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: verticalSpacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyStateIcon: {
    fontSize: normalize(48),
  },
  emptyStateTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    marginTop: verticalSpacing.md,
    marginBottom: verticalSpacing.xs,
  },
  emptyStateText: {
    fontSize: normalize(13),
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  historyItem: {
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
    marginBottom: 4,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  historyItemType: {
    fontSize: normalize(11),
    textTransform: 'capitalize',
  },
  historyItemSeparator: {
    fontSize: normalize(11),
    marginHorizontal: spacing.xs,
  },
  historyItemTime: {
    fontSize: normalize(11),
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
  deleteButton: {
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: moderateScale(80),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(10),
  },
  deleteButtonIcon: {
    fontSize: normalize(20),
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(11),
    fontWeight: '600',
    marginTop: 4,
  },
  historySummary: {
    borderRadius: moderateScale(20),
    borderWidth: 2,
    padding: spacing.lg,
  },
  historySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalSpacing.md,
  },
  historySummaryTitle: {
    fontSize: normalize(15),
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  historySummaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  historySummaryItem: {
    flex: 1,
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
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: '85%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
  },
  modalCloseIcon: {
    fontSize: normalize(24),
    fontWeight: 'bold',
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalSection: {
    marginBottom: verticalSpacing.lg,
  },
  modalLabel: {
    fontSize: normalize(12),
    fontWeight: '600',
    marginBottom: verticalSpacing.xs,
    textTransform: 'uppercase',
  },
  modalValue: {
    fontSize: normalize(16),
    fontWeight: '500',
  },
  modalThreatContainer: {
    flexDirection: 'row',
  },
  modalThreatBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
  },
  modalThreatText: {
    fontSize: normalize(13),
    fontWeight: 'bold',
  },
  modalStatusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
    alignSelf: 'flex-start',
  },
  modalStatusText: {
    fontSize: normalize(13),
    fontWeight: 'bold',
  },
  modalRecommendations: {
    padding: spacing.md,
    borderRadius: moderateScale(12),
  },
  modalRecommendationItem: {
    fontSize: normalize(13),
    marginBottom: verticalSpacing.xs,
    lineHeight: normalize(20),
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  modalDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  modalDeleteIcon: {
    fontSize: normalize(18),
  },
  modalDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  modalCloseButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  // Export Modal Styles
  exportModalContent: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingBottom: spacing.lg,
    ...shadows.lg,
  },
  exportOptions: {
    padding: spacing.lg,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: moderateScale(16),
    marginBottom: verticalSpacing.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  exportOptionActive: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  exportOptionIcon: {
    fontSize: normalize(32),
    marginRight: spacing.md,
  },
  exportOptionText: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exportOptionDesc: {
    fontSize: normalize(12),
  },
  checkmark: {
    fontSize: normalize(24),
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  exportCancelButton: {
    marginHorizontal: spacing.lg,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  exportCancelText: {
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  clearButton: {
    flexDirection: 'row',
  },
  modalThreatBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
  },
  modalThreatText: {
    fontSize: normalize(13),
    fontWeight: 'bold',
  },
  modalStatusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
    alignSelf: 'flex-start',
  },
  modalStatusText: {
    fontSize: normalize(13),
    fontWeight: 'bold',
  },
  modalRecommendations: {
    backgroundColor: colors.neutral.gray100,
    padding: spacing.md,
    borderRadius: moderateScale(12),
  },
  modalRecommendationItem: {
    fontSize: normalize(13),
    color: colors.neutral.gray700,
    marginBottom: verticalSpacing.xs,
    lineHeight: normalize(20),
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.gray200,
    gap: spacing.md,
  },
  modalDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.error.dark,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(14),
    borderWidth: 2,
    padding: spacing.md,
    ...shadows.sm,
  },
  exportOptionTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginBottom: 4,
  },
  exportOptionDesc: {
    fontSize: normalize(12),
    color: colors.neutral.gray500,
  },
  checkmark: {
    fontSize: normalize(24),
    color: colors.primary.main,
    fontWeight: 'bold',
  },
  exportCancelButton: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.neutral.gray200,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  exportCancelText: {
    fontSize: normalize(14),
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
