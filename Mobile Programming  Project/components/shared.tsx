// app/components/shared.tsx
import React from 'react';
import { Dimensions, PixelRatio, Platform, Text } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling functions
export const scale = (size: number): number => (SCREEN_WIDTH / 375) * size;
export const verticalScale = (size: number): number => (SCREEN_HEIGHT / 812) * size;
export const moderateScale = (size: number, factor: number = 0.5): number => 
  size + (scale(size) - size) * factor;

// Normalize font sizes for different screen densities
export const normalize = (size: number): number => {
  const newSize = size * (SCREEN_WIDTH / 375);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Icon Component with responsive sizing
export const Icon = ({ name, size = 24, color = '#000' }: { 
  name: string; 
  size?: number; 
  color?: string 
}) => {
  const icons: { [key: string]: string } = {
    shield: '🛡️',
    search: '🔍',
    eye: '👁️',
    alert: '⚠️',
    check: '✅',
    cross: '❌',
    globe: '🌐',
    mail: '📧',
    message: '💬',
    lock: '🔒',
    wifi: '📡',
    activity: '📊',
    users: '👥',
    zap: '⚡',
    trending: '📈',
  };
  
  const responsiveSize = moderateScale(size);
  
  return (
    <Text style={{ 
      fontSize: responsiveSize, 
      lineHeight: responsiveSize + 4,
      textAlign: 'center',
    }}>
      {icons[name] || '•'}
    </Text>
  );
};

// Shared Data
export const phishingStats = {
  threatsBlocked: 47,
  emailsScanned: 234,
  urlsChecked: 156,
  successRate: 98.7
};

export const phishingPatterns = [
  'Urgent action required',
  'Click here immediately',
  'Verify your account now',
  'Suspended account',
  'Limited time offer',
  'Congratulations! You won',
  'Tax refund pending',
  'Security alert'
];

export const suspiciousUrls = [
  'paypal-security.com',
  'amazon-login.net',
  'microsoft-verify.org',
  'bank-security.co',
  'google-signin.net'
];

// Analysis Functions
export const analyzeUrl = (url: string) => {
  const suspicious = suspiciousUrls.some(pattern => url.toLowerCase().includes(pattern));
  const hasTypos = url.includes('payapl') || url.includes('gooogle') || url.includes('mircosoft');
  const longSubdomain = (url.match(/\./g) || []).length > 3;
  const hasNumbers = /\d/.test(url.replace(/^https?:\/\//, ''));
  
  let riskScore = 0;
  let threats: string[] = [];
  
  if (suspicious) {
    riskScore += 40;
    threats.push('Domain impersonation detected');
  }
  if (hasTypos) {
    riskScore += 30;
    threats.push('Typosquatting attempt');
  }
  if (longSubdomain) {
    riskScore += 20;
    threats.push('Suspicious subdomain structure');
  }
  if (hasNumbers) {
    riskScore += 10;
    threats.push('Unusual domain pattern');
  }
  
  return { riskScore, threats };
};

export const analyzeContent = (content: string) => {
  let riskScore = 0;
  let threats: string[] = [];
  
  phishingPatterns.forEach(pattern => {
    if (content.toLowerCase().includes(pattern.toLowerCase())) {
      riskScore += 15;
      threats.push(`Phishing phrase: "${pattern}"`);
    }
  });
  
  if (content.match(/click.*here/gi)) {
    riskScore += 10;
    threats.push('Suspicious call-to-action');
  }
  
  if (content.match(/\$\d+/g)) {
    riskScore += 10;
    threats.push('Money-related content');
  }
  
  return { riskScore, threats };
};

export const getThreatColors = (level: string) => {
  switch(level) {
    case 'high': return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' };
    case 'medium': return { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' };
    case 'low': return { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' };
    default: return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
  }
};

// Interfaces
export interface ScanResult {
  id: number;
  url: string;
  type: string;
  threat: string;
  time: string;
  status: string;
}

// Initial scan data
export const initialScans: ScanResult[] = [
  { id: 1, url: 'paypal-security.com', type: 'url', threat: 'high', time: '2 min ago', status: 'blocked' },
  { id: 2, url: 'gmail message', type: 'email', threat: 'medium', time: '5 min ago', status: 'flagged' },
  { id: 3, url: 'amazon-login.net', type: 'url', threat: 'high', time: '10 min ago', status: 'blocked' },
  { id: 4, url: 'SMS verification', type: 'sms', threat: 'low', time: '15 min ago', status: 'safe' }
];

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
};

export const verticalSpacing = {
  xs: verticalScale(4),
  sm: verticalScale(8),
  md: verticalScale(12),
  lg: verticalScale(16),
  xl: verticalScale(20),
  xxl: verticalScale(24),
};

// Colors
export const colors = {
  primary: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
  success: { main: '#10B981', light: '#34D399', dark: '#059669' },
  warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
  error: { main: '#EF4444', light: '#F87171', dark: '#DC2626' },
  neutral: {
    white: '#FFFFFF',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};