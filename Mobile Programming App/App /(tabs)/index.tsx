// app/(tabs)/index.tsx - SCANNER SCREEN (Main Dashboard) - FIXED
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
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Icon,
    moderateScale,
    normalize,
    shadows,
    spacing,
    verticalScale,
    verticalSpacing
} from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useHistoryAnimations } from '../../hooks/useHistoryAnimations';

export default function ScannerScreen() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { colors, isDark, toggleTheme } = useTheme();
    const [scanInput, setScanInput] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanType, setScanType] = useState<'url' | 'email' | 'sms'>('url');

    const {
        fadeAnim,
        slideAnim,
        scaleAnim,
        bgParticle1,
        bgParticle2,
        bgParticle3,
    } = useHistoryAnimations();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated]);

    const handleScan = async () => {
        if (!scanInput.trim()) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please enter a URL, email, or message to scan');
            return;
        }

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsScanning(true);

        // Simulate scanning
        setTimeout(async () => {
            setIsScanning(false);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                'Scan Complete',
                `Analyzed: ${scanInput}\n\nResult: Safe ✓\nThreat Level: Low\nConfidence: 98%`,
                [
                    { text: 'View Details', onPress: () => router.push('/history') },
                    { text: 'OK' }
                ]
            );

            setScanInput('');
        }, 2000);
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
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0A0A1F' : colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Animated background (particles + gradient) */}
            <View style={styles.backgroundContainer}>
                <LinearGradient
                    colors={isDark ? ['#0A0A1F', '#1A0B2E', '#0A0A1F'] : [colors.gradientStart || '#E5E7EB', '#E0EAFF', '#E5E7EB']}
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
                                <Ionicons name="shield-half-sharp" size={28} color="#FFF" />
                            </LinearGradient>
                            <View style={[styles.headerBadge, { backgroundColor: colors.success }]} />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>ZeroTrust</Text>
                            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>AI Security Platform</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={toggleTheme}
                            style={styles.themeToggle}
                            activeOpacity={0.7}
                        >
                            <Text style={{ fontSize: 20 }}>{isDark ? '🌙' : '☀️'}</Text>
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
                {/* Main Scanner Card */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                    <LinearGradient colors={['#3B82F6', '#2563EB', '#1E40AF']} style={styles.scannerCard}>
                        <View style={styles.scannerHeader}>
                            <Text style={styles.scannerTitle}>AI Threat Scanner</Text>
                            <Text style={styles.scannerSubtitle}>Real-time security analysis</Text>
                        </View>

                        {/* Scan Type Selector */}
                        <View style={styles.typeSelector}>
                            {(['url', 'email', 'sms'] as const).map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeButton,
                                        scanType === type && styles.typeButtonActive
                                    ]}
                                    onPress={async () => {
                                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setScanType(type);
                                    }}
                                >
                                    <Text style={[
                                        styles.typeButtonText,
                                        scanType === type && styles.typeButtonTextActive
                                    ]}>
                                        {type.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Input Field */}
                        <View style={styles.inputContainer}>
                            <Icon
                                name={scanType === 'url' ? 'globe' : scanType === 'email' ? 'mail' : 'message'}
                                size={20}
                                color="#94A3B8"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={
                                    scanType === 'url' ? 'Enter URL to scan...' :
                                        scanType === 'email' ? 'Enter email to analyze...' :
                                            'Enter message to check...'
                                }
                                placeholderTextColor="#94A3B8"
                                value={scanInput}
                                onChangeText={setScanInput}
                                editable={!isScanning}
                                autoCapitalize="none"
                                autoCorrect={false}
                                multiline={scanType === 'sms'}
                                numberOfLines={scanType === 'sms' ? 3 : 1}
                            />
                            {scanInput.length > 0 && (
                                <TouchableOpacity onPress={() => setScanInput('')}>
                                    <Text style={styles.clearButton}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Scan Button */}
                        <TouchableOpacity
                            style={[
                                styles.scanButton,
                                isScanning && styles.scanButtonLoading
                            ]}
                            onPress={handleScan}
                            disabled={isScanning}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.scanButtonText}>
                                {isScanning ? '🔍 Scanning...' : '🛡️ Scan Now'}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* Quick Stats */}
                <Animated.View style={[styles.statsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.25)' }]}
                        onPress={() => Alert.alert('Today\'s Scans', '23 security scans performed today')}
                    >
                        <Text style={styles.statValue}>23</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today's Scans</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.25)' }]}
                        onPress={() => Alert.alert('Threats Blocked', '5 threats detected and blocked')}
                    >
                        <Text style={[styles.statValue, { color: '#DC2626' }]}>5</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Threats Blocked</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.25)' }]}
                        onPress={() => Alert.alert('Detection Rate', '99.8% accurate threat detection')}
                    >
                        <Text style={[styles.statValue, { color: '#059669' }]}>99.8%</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Detection Rate</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Quick Actions - FIXED FOR DARK MODE */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.cardBackground, borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.25)' }]}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>

                        <TouchableOpacity
                            style={[styles.actionItem, { borderBottomColor: isDark ? 'rgba(168,85,247,0.2)' : '#E5E7EB' }]}
                            onPress={() => router.push('/history')}
                        >
                            <View style={[
                                styles.actionIcon, 
                                { 
                                    backgroundColor: isDark ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.1)',
                                    borderWidth: isDark ? 1.5 : 0,
                                    borderColor: isDark ? 'rgba(96,165,250,0.6)' : 'transparent'
                                }
                            ]}>
                                <Icon name="eye" size={20} color={isDark ? '#60A5FA' : '#3B82F6'} />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={[styles.actionTitle, { color: colors.text }]}>View History</Text>
                                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>See all past scans</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionItem, { borderBottomWidth: 0 }]}
                            onPress={() => router.push('/protection')}
                        >
                            <View style={[
                                styles.actionIcon, 
                                { 
                                    backgroundColor: isDark ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.1)',
                                    borderWidth: isDark ? 1.5 : 0,
                                    borderColor: isDark ? 'rgba(52,211,153,0.6)' : 'transparent'
                                }
                            ]}>
                                <Icon name="shield" size={20} color={isDark ? '#34D399' : '#10B981'} />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={[styles.actionTitle, { color: colors.text }]}>Protection Status</Text>
                                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>Manage security settings</Text>
                            </View>
                            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
                        </TouchableOpacity>
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
        overflow: 'hidden',
    },
    gradientFill: {
        flex: 1,
        width: '100%',
        height: '100%',
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
        ...shadows.lg,
        borderRadius: moderateScale(20),
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
        padding: spacing.lg,
    },
   scrollContent: {
     paddingBottom: Platform.OS === 'ios' ? verticalScale(120) : verticalScale(115) },
    scannerCard: {
        borderRadius: moderateScale(20),
        padding: spacing.lg,
        marginBottom: verticalSpacing.lg,
        borderWidth: 1.5,
        borderColor: 'rgba(59,130,246,0.4)',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    scannerHeader: {
        marginBottom: verticalSpacing.md,
    },
    scannerTitle: {
        fontSize: normalize(22),
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    scannerSubtitle: {
        fontSize: normalize(12),
        color: 'rgba(255,255,255,0.8)',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: verticalSpacing.md,
    },
    typeButton: {
        flex: 1,
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(12),
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#FFFFFF',
    },
    typeButtonText: {
        fontSize: normalize(12),
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
    typeButtonTextActive: {
        color: '#2563EB',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(14),
        paddingHorizontal: spacing.md,
        paddingVertical: verticalScale(12),
        marginBottom: verticalSpacing.md,
    },
    input: {
        flex: 1,
        fontSize: normalize(14),
        color: '#1E293B',
        marginLeft: spacing.sm,
    },
    clearButton: {
        fontSize: normalize(18),
        color: '#94A3B8',
        fontWeight: 'bold',
        paddingLeft: spacing.sm,
    },
    scanButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        ...shadows.md,
    },
    scanButtonLoading: {
        opacity: 0.7,
    },
    scanButtonText: {
        fontSize: normalize(16),
        fontWeight: 'bold',
        color: '#2563EB',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: verticalSpacing.lg,
    },
    statCard: {
        flex: 1,
        borderRadius: moderateScale(16),
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(168,85,247,0.25)',
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    statValue: {
        fontSize: normalize(24),
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: normalize(11),
        textAlign: 'center',
    },
    card: {
        borderRadius: moderateScale(20),
        padding: spacing.lg,
        marginBottom: verticalSpacing.lg,
        borderWidth: 1.5,
        borderColor: 'rgba(168,85,247,0.25)',
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 6,
    },
    cardTitle: {
        fontSize: normalize(16),
        fontWeight: 'bold',
        marginBottom: verticalSpacing.md,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
    },
    actionIcon: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: normalize(14),
        fontWeight: '600',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: normalize(11),
    },
});
