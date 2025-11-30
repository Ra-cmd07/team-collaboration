// app/(tabs)/history.tsx - HISTORY SCREEN WITH FULL FUNCTIONALITY
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
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
import {
  colors,
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
interface GroupedScans {
  today: ScanResult[];
  yesterday: ScanResult[];
  thisWeek: ScanResult[];
  older: ScanResult[];
}

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanResult[]>(initialScans);
  const [loading, setLoading] = useState(false);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'flagged' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status' | 'threat'>('date');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Refresh function (button instead of pull-to-refresh)
  const onRefresh = () => {
    setLoading(true);
    // Simulate fetching new data
    setTimeout(() => {
      // In real app, fetch from API here
      setLoading(false);
    }, 1500);
  };

  // Delete individual scan
  const deleteScan = (scanId: string) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setScans(scans.filter(scan => scan.id !== scanId));
          },
        },
      ]
    );
  };

  // Clear all scans
  const clearAllScans = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all scan history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setScans([]);
            setSearchQuery('');
          },
        },
      ]
    );
  };

  // View scan details
  const viewScanDetails = (scan: ScanResult) => {
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
          const threatOrder = { high: 3, medium: 2, low: 1 };
          return threatOrder[b.threat] - threatOrder[a.threat];
        case 'date':
        default:
          // Parse time strings and sort by most recent
          const getMinutes = (timeStr: string) => {
            if (timeStr.includes('min ago')) return parseInt(timeStr);
            if (timeStr.includes('hour ago') || timeStr.includes('hours ago')) return parseInt(timeStr) * 60;
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
    const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString();
    const weekAgo = new Date(now.setDate(now.getDate() - 6));

    filtered.forEach(scan => {
      // Parse time (e.g., "2 min ago", "5 min ago")
      const timeStr = scan.time;
      let scanDate = new Date();

      if (timeStr.includes('min ago')) {
        const mins = parseInt(timeStr);
        scanDate = new Date(scanDate.getTime() - mins * 60000);
      } else if (timeStr.includes('hour ago') || timeStr.includes('hours ago')) {
        const hours = parseInt(timeStr);
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
      const fileName = `zerotrust_scan_history_${new Date().getTime()}.csv`;

      // Check if documentDirectory exists
      if (!FileSystem.documentDirectory) {
        Alert.alert('Export Error', 'File system not available');
        return;
      }

      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
      setExportModalVisible(false);
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export scan history');
    }
  };

  // Export to JSON
  const exportToJSON = async () => {
    try {
      const jsonContent = JSON.stringify(scans, null, 2);
      const fileName = `zerotrust_scan_history_${new Date().getTime()}.json`;

      // Check if documentDirectory exists
      if (!FileSystem.documentDirectory) {
        Alert.alert('Export Error', 'File system not available');
        return;
      }

      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
      setExportModalVisible(false);
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
    } catch (error) {
      Alert.alert('Share Error', 'Failed to share scan history');
    }
  };

  const groupedScans = getGroupedScans();
  const filteredScans = getFilteredScans();

  // Render delete button for swipe
  const renderRightActions = (scanId: string) => (
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
                style={styles.historyItem}
                onPress={() => viewScanDetails(scan)}
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
            </Swipeable>
          );
        })}
      </View>
    );
  };

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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* History Header */}
        <LinearGradient colors={['#0F172A', '#581C87', '#0F172A']} style={styles.historyHeader}>
          <View style={styles.historyHeaderContent}>
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
            </View>
            <Text style={styles.historyCount}>{filteredScans.length} scans</Text>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search scans..."
            placeholderTextColor={colors.neutral.gray400}
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
                  filter === filterOption && styles.filterButtonActive
                ]}
                onPress={() => setFilter(filterOption)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filter === filterOption && styles.filterButtonTextActive
                ]}>
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {scans.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => setSortModalVisible(true)}
              >
                <Text style={styles.sortIcon}>⇅</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.clearAllButton} onPress={clearAllScans}>
                <Text style={styles.clearAllIcon}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Grouped Scan List */}
        {filteredScans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>No scans found</Text>
            <Text style={styles.emptyStateText}>
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
          <View style={styles.historySummary}>
            <View style={styles.historySummaryHeader}>
              <Icon name="trending" size={18} color={colors.primary.main} />
              <Text style={styles.historySummaryTitle}>Analysis Summary</Text>
            </View>
            <View style={styles.historySummaryGrid}>
              <View style={styles.historySummaryItem}>
                <Text style={[styles.historySummaryValue, { color: colors.error.dark }]}>
                  {scans.filter(s => s.status === 'blocked').length}
                </Text>
                <Text style={styles.historySummaryLabel}>Threats Blocked</Text>
              </View>
              <View style={styles.historySummaryItem}>
                <Text style={[styles.historySummaryValue, { color: colors.success.dark }]}>
                  {scans.filter(s => s.status === 'safe').length}
                </Text>
                <Text style={styles.historySummaryLabel}>Safe Content</Text>
              </View>
            </View>
          </View>
        )}

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
          <View style={styles.modalContent}>
            {selectedScan && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Scan Details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* URL/Content */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Content</Text>
                    <Text style={styles.modalValue}>{selectedScan.url}</Text>
                  </View>

                  {/* Type */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Scan Type</Text>
                    <Text style={styles.modalValue}>{selectedScan.type.toUpperCase()}</Text>
                  </View>

                  {/* Threat Level */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Threat Level</Text>
                    <View style={styles.modalThreatContainer}>
                      <View style={[
                        styles.modalThreatBadge,
                        { backgroundColor: getThreatColors(selectedScan.threat).bg }
                      ]}>
                        <Text style={[
                          styles.modalThreatText,
                          { color: getThreatColors(selectedScan.threat).text }
                        ]}>
                          {selectedScan.threat.toUpperCase()} RISK
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Status */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <View style={[
                      styles.modalStatusBadge,
                      {
                        backgroundColor: selectedScan.status === 'blocked' ? '#FEE2E2' :
                          selectedScan.status === 'flagged' ? '#FEF3C7' : '#D1FAE5',
                      }
                    ]}>
                      <Text style={[
                        styles.modalStatusText,
                        {
                          color: selectedScan.status === 'blocked' ? colors.error.dark :
                            selectedScan.status === 'flagged' ? colors.warning.dark : colors.success.dark
                        }
                      ]}>
                        {selectedScan.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Time */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Scanned</Text>
                    <Text style={styles.modalValue}>{selectedScan.time}</Text>
                  </View>

                  {/* Recommendations */}
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Recommendations</Text>
                    <View style={styles.modalRecommendations}>
                      {selectedScan.status === 'blocked' && (
                        <>
                          <Text style={styles.modalRecommendationItem}>• Do not interact with this content</Text>
                          <Text style={styles.modalRecommendationItem}>• Report as phishing if received via email</Text>
                          <Text style={styles.modalRecommendationItem}>• Block sender/domain</Text>
                        </>
                      )}
                      {selectedScan.status === 'flagged' && (
                        <>
                          <Text style={styles.modalRecommendationItem}>• Proceed with caution</Text>
                          <Text style={styles.modalRecommendationItem}>• Verify sender authenticity</Text>
                          <Text style={styles.modalRecommendationItem}>• Do not provide sensitive information</Text>
                        </>
                      )}
                      {selectedScan.status === 'safe' && (
                        <>
                          <Text style={styles.modalRecommendationItem}>• Content appears safe</Text>
                          <Text style={styles.modalRecommendationItem}>• No immediate threats detected</Text>
                          <Text style={styles.modalRecommendationItem}>• Continue monitoring for changes</Text>
                        </>
                      )}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalDeleteButton}
                    onPress={() => {
                      setModalVisible(false);
                      deleteScan(selectedScan.id);
                    }}
                  >
                    <Text style={styles.modalDeleteIcon}>🗑️</Text>
                    <Text style={styles.modalDeleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Close</Text>
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
          <View style={styles.exportModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export History</Text>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.exportOptions}>
              <TouchableOpacity style={styles.exportOption} onPress={exportToCSV}>
                <Text style={styles.exportOptionIcon}>📊</Text>
                <View style={styles.exportOptionText}>
                  <Text style={styles.exportOptionTitle}>Export as CSV</Text>
                  <Text style={styles.exportOptionDesc}>Spreadsheet format for analysis</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportOption} onPress={exportToJSON}>
                <Text style={styles.exportOptionIcon}>📄</Text>
                <View style={styles.exportOptionText}>
                  <Text style={styles.exportOptionTitle}>Export as JSON</Text>
                  <Text style={styles.exportOptionDesc}>Developer-friendly format</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportOption} onPress={shareAsText}>
                <Text style={styles.exportOptionIcon}>💬</Text>
                <View style={styles.exportOptionText}>
                  <Text style={styles.exportOptionTitle}>Share as Text</Text>
                  <Text style={styles.exportOptionDesc}>Via messaging or email</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.exportCancelButton}
              onPress={() => setExportModalVisible(false)}
            >
              <Text style={styles.exportCancelText}>Cancel</Text>
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
          <View style={styles.exportModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={[styles.exportOption, sortBy === 'date' && styles.exportOptionActive]}
                onPress={() => { setSortBy('date'); setSortModalVisible(false); }}
              >
                <Text style={styles.exportOptionIcon}>📅</Text>
                <View style={styles.exportOptionText}>
                  <Text style={styles.exportOptionTitle}>Date (Most Recent)</Text>
                  <Text style={styles.exportOptionDesc}>Show newest scans first</Text>
                </View>
                {sortBy === 'date' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportOption, sortBy === 'name' && styles.exportOptionActive]}
                onPress={() => { setSortBy('name'); setSortModalVisible(false); }}
              >
                <Text style={styles.exportOptionIcon}>🔤</Text>
                <View style={styles.exportOptionText}>
                  <Text style={styles.exportOptionTitle}>Name (A-Z)</Text>
                  <Text style={styles.exportOptionDesc}>Alphabetical order</Text>
                </View>
                {sortBy === 'name' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportOption, sortBy === 'status' && styles.exportOptionActive]}
                onPress={() => { setSortBy('status'); setSortModalVisible(false); }}
              >
                <Text style={styles.exportOptionIcon}>📋</Text>
                <View style={styles.exportOptionText}>
                  <Text style={styles.exportOptionTitle}>Status</Text>
                  <Text style={styles.exportOptionDesc}>Group by blocked, flagged, safe</Text>
                </View>
                {sortBy === 'status' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportOption, sortBy === 'threat' && styles.exportOptionActive]}
                onPress={() => { setSortBy('threat'); setSortModalVisible(false); }}
              >
                <Text style={styles.exportOptionIcon}>⚠️</Text>
                <View style={styles.exportOptionText}>
                  <Text style={styles.exportOptionTitle}>Threat Level</Text>
                  <Text style={styles.exportOptionDesc}>Highest risk first</Text>
                </View>
                {sortBy === 'threat' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.exportCancelButton}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.exportCancelText}>Cancel</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
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
    color: colors.neutral.gray900,
  },
  searchClear: {
    fontSize: normalize(18),
    color: colors.neutral.gray400,
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
    borderColor: colors.primary.main,
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
    color: colors.primary.main,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterButtonText: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: colors.neutral.gray700,
  },
  filterButtonTextActive: {
    color: colors.neutral.white,
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
    color: colors.neutral.gray600,
    marginBottom: verticalSpacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  deleteButton: {
    backgroundColor: colors.error.dark,
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
    color: colors.neutral.white,
    fontSize: normalize(11),
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyStateIcon: {
    fontSize: normalize(48),
  },
  emptyStateTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: colors.neutral.gray900,
    marginTop: verticalSpacing.md,
    marginBottom: verticalSpacing.xs,
  },
  emptyStateText: {
    fontSize: normalize(13),
    color: colors.neutral.gray500,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  historySummary: {
    backgroundColor: 'rgba(239,246,255,0.8)',
    borderRadius: moderateScale(20),
    borderWidth: 2,
    borderColor: '#DBEAFE',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
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
    borderBottomColor: colors.neutral.gray200,
  },
  modalTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
  modalCloseIcon: {
    fontSize: normalize(24),
    color: colors.neutral.gray900,
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
    color: colors.neutral.gray500,
    marginBottom: verticalSpacing.xs,
    textTransform: 'uppercase',
  },
  modalValue: {
    fontSize: normalize(16),
    color: colors.neutral.gray900,
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
    gap: spacing.sm,
  },
  modalDeleteIcon: {
    fontSize: normalize(18),
  },
  modalDeleteButtonText: {
    color: colors.neutral.white,
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  modalCloseButton: {
    flex: 1,
    backgroundColor: colors.neutral.gray200,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    color: colors.neutral.gray900,
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
  // Export Modal Styles
  exportModalContent: {
    backgroundColor: colors.neutral.white,
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
    backgroundColor: colors.neutral.gray100,
    padding: spacing.lg,
    borderRadius: moderateScale(16),
    marginBottom: verticalSpacing.md,
  },
  exportOptionActive: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 2,
    borderColor: colors.primary.main,
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
    fontWeight: 'bold',
    color: colors.neutral.gray900,
  },
});
