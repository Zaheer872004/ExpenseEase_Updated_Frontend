import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  // Use AsyncStorage instead of Keychain
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { Platform } from 'react-native';
  
 
  
  // Define User type
  interface User {
    username: string;
  }
  
  // Auth response from your backend
  interface AuthResponse {
    username: string | null;
    password: string | null;
    accessToken: string;
    token: string; // This is the refresh token
  }
  
  // Define types
  interface AuthContextType {
    // userId: string | null; 
    user: User | null;
    isAuthenticated: boolean | undefined;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; msg?: string }>;
    logout: () => Promise<{ success: boolean; msg?: string }>;
    register: (
      firstName: string,
      lastName: string,
      username: string,
      email: string,
      password: string,
      phoneNumber: string
    ) => Promise<{ success: boolean; msg?: string }>;
    getRefreshToken: () => Promise<{ success: boolean; msg?: string }>;
    
  }
  
  // Create context with default value
  export const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  // Props type for the provider
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  // API URL configuration based on platform
  const API_URL = Platform.select({
    android: 'http://10.108.79.13:8000', // Your computer's IP on the network
    ios: 'http://192.168.143.13:8000',
    web: 'http://localhost:8000',
    default: 'http://192.168.143.13:8000',
  });
  
  // Helper functions for storage - now using AsyncStorage
  export const storeAuthData = async (key: string, value: string) => {
    try {
      // Web localStorage support check using typeof global check instead of window
    //   if (typeof global.localStorage !== 'undefined') {
    //     global.localStorage.setItem(key, value);
    //     return;
    //   }
      // Store in AsyncStorage
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // Silent error handling
    }
  };
  
  export const getAuthData = async (key: string): Promise<string | null> => {
    try {
    //   // Web localStorage support check using typeof global check instead of window
    //   if (typeof global.localStorage !== 'undefined') {
    //     return global.localStorage.getItem(key);
    //   }
      // Get from AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };
  
  export const removeAuthData = async (key: string) => {
    try {
      // Web localStorage support check using typeof global check instead of window
    //   if (typeof global.localStorage !== 'undefined') {
    //     global.localStorage.removeItem(key);
    //     return;
    //   }
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Silent error handling
    }
  };
  
  // Provider component
  export const AuthContextProvider = ({ children }: AuthProviderProps) => {
    // const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
  
    // When the component mounts, check if the user is already logged in
    useEffect(() => {
      const checkAuthStatus = async () => {
        try {
          const accessToken = await getAuthData("accessToken");
          const username = await getAuthData("username");
          const refreshToken = await getAuthData("token");
          if (accessToken) {
            const isLoggedIn = await fetch(`${API_URL}/auth/v1/ping`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            const response = await isLoggedIn.text();
            if (response === "") {
              const refreshResponse = await getRefreshToken();
              if (!refreshResponse.success) {
                setUser(null);
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
              }
            }
          }
          if (username && accessToken && refreshToken) {
            setUser({ username });
            
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          setIsAuthenticated(false);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };
      checkAuthStatus();
    }, []);
  
    const login = async (username: string, password: string) => {
      try {
        // Clean up any previous auth data before attempting login
        await removeAuthData("accessToken");
        await removeAuthData("token");
        await removeAuthData("username");
        
        // Reset the authentication state
        setIsAuthenticated(false);
        setUser(null);
        
        // Simple fetch with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${API_URL}/auth/v1/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          signal: controller.signal
        });
        

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Try to get response text for better debugging
          let errorText = "";
          try {
            errorText = await response.text();
          } catch (e) {
            // Silently handle error
          }
          
          if (response.status === 401) {
            return { 
              success: false, 
              msg: "Invalid username or password" 
            };
          }
          
          return { 
            success: false, 
            msg: `Login failed (${response.status})${errorText ? ': ' + errorText : ''}` 
          };
        }
        
        const data: AuthResponse = await response.json();
        
        if (!data.accessToken || !data.token) {
          return { success: false, msg: "Invalid server response (missing tokens)" };
        }
        
        // Store auth data in secure storage
        await storeAuthData("accessToken", data.accessToken);
        await storeAuthData("token", data.token); // This is the refresh token
        await storeAuthData("username", username);
        
        // Update auth state only after storage is successful
        setUser({ username });
        setIsAuthenticated(true);
        
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          msg: error.name === 'AbortError' 
            ? "Request timed out. Server might be unreachable."
            : error.message || "An error occurred during login" 
        };
      }
    };
  
    const logout = async () => {
      try {
        // Set auth state to undefined during logout process
        setIsAuthenticated(undefined);
        
        // Get the refresh token (required for logout)
        const token = await getAuthData("token");
        
        if (!token) {
          // Clean up anyway
          await removeAuthData("accessToken");
          await removeAuthData("token");
          await removeAuthData("username");
          setUser(null);
          setIsAuthenticated(false);
          return { success: false, msg: "No active session to logout" };
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${API_URL}/auth/v1/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Important: Ensure we clear all data regardless of server response
        await removeAuthData("accessToken");
        await removeAuthData("token");
        await removeAuthData("username");
        
        // Wait a small amount of time to ensure storage is updated
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Finally update state
        setUser(null);
        setIsAuthenticated(false);
        
        if (!response.ok) {
          return { success: false, msg: `Logout failed on server (${response.status})` };
        }
        
        return { success: true };
      } catch (error: any) {
        // Clean up local storage even if request fails
        await removeAuthData("accessToken");
        await removeAuthData("token");
        await removeAuthData("username");
        
        // Wait a small amount of time to ensure storage is updated
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setUser(null);
        setIsAuthenticated(false);
        
        return { 
          success: false, 
          msg: error.name === 'AbortError' 
            ? "Request timed out. Server might be unreachable."
            : error.message || "An error occurred during logout" 
        };
      }
    };
  
    const register = async (
      firstName: string,
      lastName: string,
      username: string,
      email: string,
      password: string,
      phoneNumber: string
    ) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${API_URL}/auth/v1/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            username,
            email,
            password,
            phoneNumber
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          return { success: false, msg: `Registration failed (${response.status})` };
        }
        
        const data: AuthResponse = await response.json();
        
        // Store auth data in secure storage
        await storeAuthData("accessToken", data.accessToken);
        await storeAuthData("token", data.token); // This is the refresh token
        await storeAuthData("username", data.username || username);
        
        setUser({ username: data.username || username });
        setIsAuthenticated(true);
        
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          msg: error.name === 'AbortError' 
            ? "Request timed out. Server might be unreachable."
            : error.message || "An error occurred during registration" 
        };
      }
    };
    
    const getRefreshToken = async () => {
      try {
        // Get the refresh token
        const token = await getAuthData("token");
        
        if (!token) {
          setIsAuthenticated(false);
          return { success: false, msg: "No refresh token available" };
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${API_URL}/auth/v1/refreshToken`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // If refresh token is invalid or expired, logout the user
          if (response.status === 401 || response.status === 403) {
            await logout();
          }
          
          return { success: false, msg: `Token refresh failed (${response.status})` };
        }
        
        const data: AuthResponse = await response.json();
        
        // Update the access token
        await storeAuthData("accessToken", data.accessToken);
        await storeAuthData("token", data.token); // This is the new refresh token
        
        // Get current username in case it's not in the response
        const username = await getAuthData("username");
        
        if (username) {
          setUser({ username });
          setIsAuthenticated(true);
        }
        
        return { success: true };
      } catch (error: any) {
        // If we can't refresh the token, log the user out
        if (error.name !== 'AbortError') {
          await logout();
        }
        
        return { 
          success: false, 
          msg: error.name === 'AbortError' 
            ? "Request timed out. Server might be unreachable."
            : error.message || "An error occurred during token refresh" 
        };
      }
    };
  
    return (
      <AuthContext.Provider
        value={{ 
          // userId,
          user, 
          isAuthenticated, 
          login, 
          logout, 
          register,
          getRefreshToken,
          isLoading,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
  // Custom hook to use the AuthContext
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
  };