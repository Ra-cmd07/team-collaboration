// services/authService.ts - REAL API INTEGRATION
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';

// Real API Configuration
const API_BASE_URL = 'https://citc-ustpcdo.com/api/v1/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  auth_token: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  id_number: string;
  department?: {
    id: number;
    name: string;
    code: string;
    college: number;
  };
  middle_name?: string;
  [key: string]: any;
}

export interface AuthState {
  token: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
}

const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
};

class AuthService {
  /**
   * Login with real API
   * POST /auth/token/login/
   */
  async login(credentials: LoginCredentials): Promise<AuthState> {
    try {
      console.log('🔐 Starting login process...');
      console.log('👤 Username:', credentials.username);
      console.log('🌐 API URL:', API_BASE_URL);

      // Step 1: Get auth token
      console.log('⏳ Step 1: Requesting auth token...');
      const loginResponse = await api.post<LoginResponse>('auth/token/login/', {
        id_number: credentials.username,
        password: credentials.password
      });

      console.log('✅ Token received!');
      console.log('📦 Response status:', loginResponse.status);
      console.log('🔑 Auth token:', loginResponse.data.auth_token);

      const authToken = loginResponse.data.auth_token;

      // Step 2: Get user profile
      console.log('⏳ Step 2: Fetching user profile...');
      const profileResponse = await api.get<UserData>('auth/users/me/', {
        headers: {
          'Authorization': `Token ${authToken}`
        }
      });

      console.log('✅ Profile received!');
      console.log('📦 Response status:', profileResponse.status);
      console.log('👤 User data:', JSON.stringify(profileResponse.data, null, 2));

      const userData = profileResponse.data;

      // Step 3: Store auth data
      console.log('💾 Step 3: Storing auth data...');
      await this.storeAuthData(authToken, userData);
      console.log('✅ Auth data stored successfully!');

      console.log('🎉 LOGIN SUCCESSFUL!');
      console.log('👤 Logged in as:', `${userData.first_name} ${userData.last_name}`);
      console.log('📧 Email:', userData.email);
      console.log('🆔 ID Number:', userData.id_number);

      return {
        token: authToken,
        user: userData,
        isAuthenticated: true,
      };
    } catch (error) {
      console.error('🚨 LOGIN FAILED:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        console.error('❌ Error details:', {
          message: axiosError.message,
          code: axiosError.code,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        
        // Timeout error
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('⏱️ Request timeout - Please check your internet connection');
        }
        
        // Network error
        if (axiosError.code === 'ERR_NETWORK') {
          throw new Error('🌐 Network error - Cannot reach server');
        }

        // Server response errors
        if (axiosError.response) {
          const status = axiosError.response.status;
          const data = axiosError.response.data;
          
          if (status === 400) {
            throw new Error(data?.non_field_errors?.[0] || 'Invalid credentials');
          }
          
          if (status === 401) {
            throw new Error('Invalid ID number or password');
          }
          
          if (status === 404) {
            throw new Error('API endpoint not found');
          }
          
          if (status >= 500) {
            throw new Error('Server error - Please try again later');
          }
          
          throw new Error(`Server error: ${status}`);
        }
        
        // Request made but no response
        if (axiosError.request) {
          throw new Error('📡 No response from server - Check your connection');
        }
      }
      
      // Generic error
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Unknown error during login');
    }
  }

  /**
   * Store authentication data in AsyncStorage
   */
  async storeAuthData(token: string, user: UserData): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.AUTH_TOKEN, token],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      ]);
      console.log('✅ Data stored in AsyncStorage');
    } catch (error) {
      console.error('❌ Error storing auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Get stored authentication data
   */
  async getStoredAuthData(): Promise<AuthState> {
    try {
      const [[, token], [, userData]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      if (!token || !userData) {
        console.log('ℹ️ No stored auth data found');
        return {
          token: null,
          user: null,
          isAuthenticated: false,
        };
      }

      console.log('✅ Retrieved stored auth data');
      return {
        token,
        user: JSON.parse(userData),
        isAuthenticated: true,
      };
    } catch (error) {
      console.error('❌ Error retrieving auth data:', error);
      return {
        token: null,
        user: null,
        isAuthenticated: false,
      };
    }
  }

  /**
   * Logout and clear stored data
   */
  async logout(token?: string): Promise<void> {
    try {
      console.log('🚪 Logging out...');
      
      // Optionally call logout API endpoint if available
      if (token) {
        try {
          await api.post('auth/token/logout/', {}, {
            headers: {
              'Authorization': `Token ${token}`
            }
          });
          console.log('✅ Server logout successful');
        } catch (error) {
          console.warn('⚠️ Server logout failed, clearing local data anyway');
        }
      }
      
      // Clear local storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      console.log('✅ Local auth data cleared');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get stored auth token
   */
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }

  /**
   * Refresh user profile from server
   */
  async refreshUserProfile(token: string): Promise<UserData> {
    try {
      console.log('🔄 Refreshing user profile...');
      const response = await api.get<UserData>('auth/users/me/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      const userData = response.data;
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('✅ User profile refreshed');
      
      return userData;
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;

/*
 * 🔐 REAL API INTEGRATION
 * 
 * API Endpoints:
 * - Login: POST /auth/token/login/
 *   Body: { id_number: string, password: string }
 *   Response: { auth_token: string }
 * 
 * - Get Profile: GET /auth/users/me/
 *   Headers: { Authorization: "Token <auth_token>" }
 *   Response: UserData object
 * 
 * To test in Network Inspector:
 * 1. Open Chrome DevTools (F12)
 * 2. Go to Network tab
 * 3. Enter valid credentials (e.g., ID: 2023302988)
 * 4. Click "Sign In Securely"
 * 5. You'll see:
 *    - POST request to /auth/token/login/ with response token
 *    - GET request to /auth/users/me/ with user profile
 */