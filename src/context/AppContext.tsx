'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { getFirstAllowedAdminPath } from '@/lib/adminAccess';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'artist' | 'label' | 'admin' | 'subadmin';
  artistName?: string;
  accountType?: 'artist' | 'label';
  adminPreset?: string;
  permissions?: string[];
  verification?: {
    status?: 'pending' | 'submitted' | 'approved' | 'rejected';
    mobileProvider?: string;
    kycProvider?: string;
    consent?: boolean;
    phoneNumber?: string;
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    notes?: string;
  };
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  accountType: 'artist' | 'label';
  role?: User['role'];
  // artist fields
  artistName?: string;
  legalName?: string;
  idType?: 'pan' | 'aadhaar';
  idNumber?: string;
  legalAddress?: string;
  phoneNumber?: string;
  numberOfTracks?: number;
  numberOfReleases?: number;
  governmentIdFile?: File;
  // label fields
  labelName?: string;
  registrationType?: 'individual' | 'registered_company';
  labelLegalName?: string;
  legalEntityName?: string;
  companyType?: 'private' | 'public';
  incorporationCertFile?: File;
  gstCertFile?: File;
  labelGovIdFile?: File;
  totalArtists?: number;
  totalRevenue?: number;
  catalogSize?: number;
  rightsType?: 'exclusive' | 'non_exclusive';
  companyWebsite?: string;
  socialLinks?: Record<string, string>;
  bio?: string;
  verification?: {
    phoneNumber?: string;
    mobileProvider?: 'surepass' | 'sandbox' | 'manual';
    kycProvider?: 'surepass' | 'sandbox' | 'manual';
    consent?: boolean;
  };
}

interface AuthResponse {
  data: {
    token: string;
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: User['role'];
    artistName?: string;
    accountType?: 'artist' | 'label';
    adminPreset?: string;
    permissions?: string[];
    verification?: User['verification'];
  };
}

interface UserPayload {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: User['role'];
  artistName?: string;
  accountType?: 'artist' | 'label';
  adminPreset?: string;
  permissions?: string[];
  verification?: User['verification'];
}

interface DecodedToken {
  exp: number;
  id: string;
  name: string;
  email: string;
  role: User['role'];
  artistName?: string;
  accountType?: 'artist' | 'label';
  adminPreset?: string;
  permissions?: string[];
  verification?: User['verification'];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupPayload) => Promise<void>;
  startSignup: (userData: SignupPayload) => Promise<void>;
  verifySignup: (payload: { email: string; emailOtp: string; smsOtp: string }) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AppContext = createContext<AuthContextType | undefined>(undefined);

const API_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    : 'http://localhost:5000/api';

const fallbackAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {
    throw new Error('Auth provider is not initialized');
  },
  signup: async () => {
    throw new Error('Auth provider is not initialized');
  },
  startSignup: async () => {
    throw new Error('Auth provider is not initialized');
  },
  verifySignup: async () => {
    throw new Error('Auth provider is not initialized');
  },
  logout: () => undefined,
  getToken: () => null,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const toUser = (payload: UserPayload): User => ({
  id: payload._id || payload.id || '',
  name: payload.name,
  email: payload.email,
  role: payload.role,
  artistName: payload.artistName,
  accountType: payload.accountType,
  adminPreset: payload.adminPreset,
  permissions: payload.permissions || [],
  verification: payload.verification,
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get('token') || null;
  }, []);

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;

    Cookies.remove('token');
    setUser(null);
    setIsLoading(false);
    window.location.assign('/login');
  }, []);

  const checkAuth = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setUser(toUser(decoded));

      try {
        const response = await axios.get<{ data?: AuthResponse['data'] }>('/auth/me');
        if (response.data?.data) {
          setUser(toUser(response.data.data));
        }
      } catch {
        // Fall back to token data if the profile refresh request fails.
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [getToken, logout]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    axios.defaults.baseURL = API_URL;

    const requestInterceptorId = axios.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    void checkAuth();

    return () => {
      axios.interceptors.request.eject(requestInterceptorId);
    };
  }, [checkAuth, getToken]);

  const login = async (email: string, password: string) => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);
    try {
      const response = await axios.post<AuthResponse>('/auth/login', { email, password });
      const { token, ...userData } = response.data.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      Cookies.set('token', token, {
        expires: 30,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });

      const currentUser = toUser({ ...userData, artistName: userData.artistName || userData.name });
      setUser(currentUser);

      const redirectUrl = userData.role === 'admin' || userData.role === 'subadmin'
        ? getFirstAllowedAdminPath(currentUser)
        : '/dashboard';
      window.location.assign(redirectUrl);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const startSignup = async (userData: SignupPayload) => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);
    try {
      const signupCheckResponse = await fetch('/api/settings/signup-enabled');
      const signupCheckData = await signupCheckResponse.json();

      if (!signupCheckData.enabled) {
        throw new Error('New user registration is currently disabled');
      }

      // Build FormData when file fields are present
      const hasFiles =
        userData.governmentIdFile ||
        userData.labelGovIdFile ||
        userData.incorporationCertFile ||
        userData.gstCertFile;

      let response;

      if (hasFiles) {
        const formData = new FormData();
        // Append all scalar fields
        const scalarFields: (keyof SignupPayload)[] = [
          'name', 'email', 'password', 'accountType', 'role',
          'artistName', 'legalName', 'idType', 'idNumber', 'legalAddress',
          'phoneNumber', 'numberOfTracks', 'numberOfReleases',
          'labelName', 'registrationType', 'labelLegalName', 'legalEntityName',
          'companyType', 'totalArtists', 'totalRevenue', 'catalogSize',
          'rightsType', 'companyWebsite', 'bio',
        ];
        scalarFields.forEach((key) => {
          const val = userData[key];
          if (val !== undefined && val !== null) {
            formData.append(key, String(val));
          }
        });
        if (userData.socialLinks) {
          formData.append('socialLinks', JSON.stringify(userData.socialLinks));
        }
        // Append files
        if (userData.governmentIdFile) formData.append('governmentIdFile', userData.governmentIdFile);
        if (userData.labelGovIdFile) formData.append('labelGovIdFile', userData.labelGovIdFile);
        if (userData.incorporationCertFile) formData.append('incorporationCertFile', userData.incorporationCertFile);
        if (userData.gstCertFile) formData.append('gstCertFile', userData.gstCertFile);

        response = await axios.post<AuthResponse>('/auth/signup/start', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axios.post<AuthResponse>('/auth/signup/start', userData);
      }

      return response.data as any;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Signup verification failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const verifySignup = async (payload: { email: string; emailOtp: string; smsOtp: string }) => {
    if (typeof window === 'undefined') return;

    setIsLoading(true);
    try {
      const response = await axios.post<AuthResponse>('/auth/signup/verify', payload);
      const { token } = response.data.data;

      Cookies.set('token', token, {
        expires: 30,
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });

      setUser(toUser(jwtDecode<DecodedToken>(token)));
      window.location.assign('/dashboard');
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Signup failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = startSignup;

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    startSignup,
    verifySignup,
    logout,
    getToken,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AppContext);
  return context ?? fallbackAuthContext;
};
