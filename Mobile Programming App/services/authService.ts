// services/authService.ts - TEST WITH CAT API TO VERIFY APP WORKS
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';

// TEST MODE: Using cat API
const TEST_API_URL = 'https://cataas.com';

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
   * TEST LOGIN - Verifies app networking works
   */
  async login(credentials: LoginCredentials): Promise<AuthState> {
    try {
      console.log('🧪 TEST MODE ACTIVE');
      console.log('👤 Username entered:', credentials.username);
      console.log('📍 Testing network with:', TEST_API_URL);

      // Test if network/axios works by calling cat API
      console.log('⏳ Making test network request...');
      
      const testResponse = await axios.get('https://cataas.com/cat', {
        timeout: 30000,
      });

      console.log('✅ SUCCESS! Network is working!');
      console.log('📦 Response status:', testResponse.status);
      console.log('📦 Response headers:', testResponse.headers);

      // Create mock authentication data
      const mockToken = 'test_token_' + Date.now();
      const mockUser: UserData = {
        id: 1,
        username: credentials.username,
        email: credentials.username + '@test.com',
        first_name: 'Test',
        last_name: 'User',
      };

      console.log('💾 Creating mock session...');
      await this.storeAuthData(mockToken, mockUser);
      console.log('✅ Mock session created!');

      console.log('🎉 TEST LOGIN SUCCESSFUL!');
      console.log('👤 Mock user:', mockUser);

      return {
        token: mockToken,
        user: mockUser,
        isAuthenticated: true,
      };
    } catch (error) {
      console.error('🚨 TEST FAILED:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        console.error('❌ Error details:', {
          message: axiosError.message,
          code: axiosError.code,
          status: axiosError.response?.status,
        });
        
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error('⏱️ Timeout - Check internet connection');
        }
        
        if (axiosError.code === 'ERR_NETWORK') {
          throw new Error('🌐 Network error - No internet');
        }

        if (axiosError.response) {
          throw new Error(`Server error: ${axiosError.response.status}`);
        }
        
        if (axiosError.request) {
          throw new Error('📡 No response from server');
        }
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Unknown error during test');
    }
  }

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

  async logout(token?: string): Promise<void> {
    try {
      console.log('🚪 Logging out (test mode)...');
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

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;

/*
 * 🧪 TEST MODE INSTRUCTIONS:
 * 
 * This version tests if your app networking works by calling https://cataas.com/cat
 * 
 * TO TEST:
 * 1. Replace your authService.ts with this file
 * 2. Restart the app
 * 3. Enter ANY username/password
 * 4. Tap "Sign In Securely"
 * 
 * EXPECTED RESULT:
 * ✅ If network works: You'll be logged in with mock data
 * ❌ If network fails: You'll see specific error about connection
 * 
 * AFTER TEST SUCCESS:
 * Switch back to the real API version and get valid credentials from your backend team
 */
