import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getAuthData, storeAuthData } from '../context/authContext';

// API URL configuration based on platform
export const API_URL = Platform.select({
  android: 'http://10.108.79.13:8000', //10.108.79.13
  ios: 'http://192.168.143.13:8000',
  web: 'http://localhost:8000',
  default: 'http://192.168.143.13:8000',
});

// Request methods
export enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

interface RequestOptions {
  method: Method;
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  useRefreshToken?: boolean;
}

class ApiClient {
  // Singleton instance
  private static instance: ApiClient;
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  // Get singleton instance
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  
  /**
   * Handle API requests with authentication and refresh token logic
   */
  public async request<T>(options: RequestOptions): Promise<T> {
    const { 
      method, 
      endpoint, 
      body, 
      headers = {},
      requiresAuth = true,
      useRefreshToken = false
    } = options;
    
    try {
      // Get auth header if needed
      let authHeaders = {};
      if (requiresAuth) {
        const token = useRefreshToken 
          ? await getAuthData("token")
          : await getAuthData("accessToken");
        
        if (!token) {
          throw new Error('Authentication required but token is missing');
        }
        
        authHeaders = {
          Authorization: `Bearer ${token}`
        };
      }
      
      // Prepare request options
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...headers
        }
      };
      
      // Add body for non-GET requests
      if (method !== Method.GET && body) {
        requestOptions.body = JSON.stringify(body);
      }
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000);
      });
      
      // Create fetch promise
      const fetchPromise = fetch(`${API_URL}/${endpoint}`, requestOptions);
      
      // Race between fetch and timeout
      const response: Response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      // Handle specific error cases
      if (response.status === 401 && !useRefreshToken) {
        // Try to refresh token if unauthorized
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          // Retry the original request with new token
          return this.request<T>(options);
        } else {
          throw new Error('Session expired. Please login again.');
        }
      }
      
      // Handle HTTP errors
      if (!response.ok) {
        let errorMsg = `Request failed with status ${response.status}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            if (errorData.message || errorData.error) {
              errorMsg = errorData.message || errorData.error;
            }
          } else {
            errorMsg = await response.text();
          }
        } catch (e) {
          // Failed to parse error response, use default message
        }
        
        throw new Error(errorMsg);
      }
      
      // Handle no-content responses
      if (response.status === 204) {
        return {} as T;
      }
      
      // Parse response based on content type
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json() as T;
      } else {
        const text = await response.text();
        return text as unknown as T;
      }
      
    } catch (error: any) {
      console.error(`API Error: ${method} ${endpoint}`, error);
      throw error;
    }
  }
  
  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<{ success: boolean; message?: string }> {
    try {
      const token = await getAuthData("token");
      
      if (!token) {
        return { success: false, message: 'No refresh token available' };
      }
      
      const response = await this.request<{
        accessToken: string;
        token: string;
      }>({
        method: Method.POST,
        endpoint: 'auth/v1/refreshToken',
        body: { token },
        requiresAuth: false
      });
      
      if (response.accessToken && response.token) {
        await storeAuthData("accessToken", response.accessToken);
        await storeAuthData("token", response.token);
        return { success: true };
      }
      
      return { success: false, message: 'Invalid refresh token response' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export default ApiClient.getInstance();