'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'artist' | 'admin';
  artistName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

// Create context
const AppContext = createContext<AuthContextType | undefined>(undefined);

// API URL from environment or default
const API_URL = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  : 'http://localhost:5000/api'; // Default for SSR

// Provider component
export function AppContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Configure axios defaults
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip during SSR

    console.log('Setting up axios with base URL:', API_URL);
    axios.defaults.baseURL = API_URL;
    
    // Add request interceptor for debugging
    const requestInterceptorId = axios.interceptors.request.use((config) => {
      console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`, config.data || '');
      
      // Add authorization header to every request if token exists
      const token = getToken();
      if (token) {
        // Ensure headers object exists
        config.headers = config.headers || {};
        
        // Set Authorization header with Bearer token
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('Setting Authorization header:', `Bearer ${token}`);
      }
      return config;
    }, (error) => {
      console.error('Request error interceptor:', error);
      return Promise.reject(error);
    });
    
    // Add response interceptor for debugging
    const responseInterceptorId = axios.interceptors.response.use((response) => {
      console.log(`Response from ${response.config.url}:`, response.data);
      return response;
    }, (error) => {
      console.error('Response error interceptor:', error.response?.data || error.message);
      return Promise.reject(error);
    });

    // Initial auth check
    checkAuth();
    
    // Clean up interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptorId);
      axios.interceptors.response.eject(responseInterceptorId);
    };
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    const token = getToken();
    
    if (!token) {
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }
    
    try {
      // Verify token by decoding and checking expiration
      const decoded: any = jwtDecode(token);
      console.log('Decoded token:', decoded);
      
      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        console.log('Token expired, logging out');
        logout();
        return;
      }
      
      // Set user from token data
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        artistName: decoded.artistName
      });
      
      // Try to get fresh user data
      try {
        const response = await axios.get('/auth/me');
        if (response.data?.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Failed to get fresh user data:', error);
        // Continue with token data
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    setIsLoading(true);
    try {
      console.log('Attempting login with:', { email });
      
      const response = await axios.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token, ...userData } = response.data.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Save token in cookie with secure flags
      Cookies.set('token', token, { 
        expires: 30, 
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });
      
      // Update user state with the complete user data from the response
      setUser({
        id: userData._id || userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        artistName: userData.artistName || userData.name
      });
      
      console.log('User data after login:', userData);
      console.log('User role after login:', userData.role);
      
      // Use window.location for more reliable redirects
      const redirectUrl = userData.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      console.log('Redirecting to:', redirectUrl);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: any) => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    setIsLoading(true);
    try {
      // Check if signups are enabled first
      const signupCheckResponse = await fetch('/api/settings/signup-enabled');
      const signupCheckData = await signupCheckResponse.json();
      
      if (!signupCheckData.enabled) {
        throw new Error('New user registration is currently disabled');
      }
      
      console.log('Registering with data:', userData);
      
      const response = await axios.post('/auth/register', userData);
      console.log('Register response:', response.data);
      
      const { token } = response.data.data;
      
      // Save token in cookie
      Cookies.set('token', token, { expires: 30, sameSite: 'Lax' });
      
      // Decode token to get user data
      const decoded: any = jwtDecode(token);
      console.log('Decoded token after signup:', decoded);
      
      // Update user state based on token data
      const user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        artistName: decoded.artistName
      };
      
      setUser(user);
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    // Remove token from cookies
    Cookies.remove('token');
    
    // Clear user state
    setUser(null);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Get token from cookies
  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null; // Skip during SSR
    return Cookies.get('token') || null;
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    getToken,
  };

  // Don't render children until client-side initialization is complete
  if (!isInitialized && typeof window !== 'undefined') {
    return <div style={{ display: 'none' }}>{children}</div>;
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    // During SSR or hydration, return a safe default instead of throwing
    if (typeof window === 'undefined') {
      return {
        user: null,
        isLoading: true,
        isAuthenticated: false,
        login: async () => {},
        signup: async () => {},
        logout: () => {},
        getToken: () => null
      };
    }
    // Also handle client-side hydration issues
    console.warn('useAuth called outside AppContextProvider, returning safe defaults');
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: async () => { throw new Error('Auth not initialized'); },
      signup: async () => { throw new Error('Auth not initialized'); },
      logout: () => { console.warn('Auth not initialized'); },
      getToken: () => null
    };
  }
  return context;
}; 