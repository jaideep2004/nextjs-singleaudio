import axios from 'axios';
import Cookies from 'js-cookie';

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// For server-side requests, use the full URL
// For client-side requests, use relative URLs to avoid CORS issues
const API_BASE_URL = isBrowser 
  ? '/api'  // This will be handled by Next.js API routes
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies to be sent with requests
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

// Helper function to handle API errors
const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error:', error.message);
    throw error;
  }
};

// API functions for Authentication
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<{ token: string; user: any }>>(
        '/auth/login', 
        { email, password }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  signup: async (userData: any) => {
    try {
      const response = await api.post<ApiResponse<{ token: string; user: any }>>(
        '/auth/register', 
        userData
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get<ApiResponse<any>>('/auth/me');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  updateProfile: async (userData: any) => {
    try {
      const response = await api.put<ApiResponse<any>>('/auth/me', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.put<ApiResponse<any>>('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Types for Track API
export interface Track {
  id: string;
  title: string;
  artist: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Track API
export const trackAPI = {
  getTracks: async (params: any = {}): Promise<{ success: boolean; data: any; error?: string }> => {
    try {
      const response = await api.get('/tracks', { params });
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching tracks:', error);
      // Return empty array for development
      return {
        success: true,
        data: []
      };
    }
  },

  getTrackById: async (id: string): Promise<ApiResponse<Track>> => {
    try {
      const response = await api.get<ApiResponse<Track>>(`/tracks/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Track with ID ${id} not found, using mock data`);
      return {
        success: true,
        message: 'Using mock data',
        data: {
          id,
          title: 'Sample Track',
          artist: 'Sample Artist',
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
  },

  createTrack: async (data: Omit<Track, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Track>> => {
    try {
      const response = await api.post<ApiResponse<Track>>('/tracks', data);
      return response.data;
    } catch (error) {
      console.error('Error creating track:', error);
      return {
        success: false,
        error: 'Failed to create track',
        message: 'Failed to create track. Please try again later.',
      };
    }
  },

  updateTrack: async (id: string, data: Partial<Track>): Promise<ApiResponse<Track>> => {
    try {
      const response = await api.put<ApiResponse<Track>>(`/tracks/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating track ${id}:`, error);
      return {
        success: false,
        error: 'Failed to update track',
        message: 'Failed to update track. Please try again later.',
      };
    }
  },

  deleteTrack: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      const response = await api.delete<ApiResponse<{ id: string }>>(`/tracks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting track ${id}:`, error);
      return {
        success: false,
        error: 'Failed to delete track',
        message: 'Failed to delete track. Please try again later.',
      };
    }
  }
};

// API functions for Releases
export const releaseAPI = {
  getReleases: async (params: any = {}) => {
    try {
      const response = await api.get('/releases', { params });
      // API route returns { success, releases }
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.releases || [],
        };
      } else {
        return {
          success: false,
          data: [],
          error: response.data?.error || 'Failed to fetch releases',
        };
      }
    } catch (error) {
      console.error('Error fetching releases:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Unknown error',
      };
    }
  },
};

// API functions for Royalties
export const royaltyAPI = {
  getRoyalties: async (filters?: any) => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/royalties', { params: filters });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRoyaltyById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/royalties/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRoyaltyReports: async (year: number, month: number) => {
    try {
      const response = await api.get<ApiResponse<any>>('/royalties/reports', {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// API functions for Payouts
export const payoutAPI = {
  requestPayout: async (payoutData: any) => {
    try {
      const response = await api.post<ApiResponse<any>>('/payouts/request', payoutData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getPayouts: async () => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/payouts');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getPayoutById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/payouts/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  updatePayoutStatus: async (id: string, status: string, reason?: string) => {
    try {
      const response = await api.patch<ApiResponse<any>>(`/payouts/${id}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// API functions for Notifications
export const notificationAPI = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty array for development
      return {
        success: true,
        data: []
      };
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await api.patch<ApiResponse<any>>(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.patch<ApiResponse<any>>('/notifications/read-all');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// API functions for public endpoints (no authentication required)
export const publicAPI = {
  // Get a public setting
  getSetting: async (key: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/api/settings/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching public setting ${key}:`, error);
      return { success: false, message: `Failed to fetch setting: ${key}`, data: null };
    }
  },
  
  // Check if signups are enabled
  checkSignupEnabled: async () => {
    try {
      const response = await api.get<ApiResponse<any>>('/api/settings/signup-enabled');
      return {
        success: true,
        enabled: response.data.enabled === true
      };
    } catch (error) {
      console.error('Error checking if signups are enabled:', error);
      // Default to disabled if there's an error
      return { success: false, enabled: false };
    }
  },
};

// API functions for Admin
export const adminAPI = {
  getUsers: async (params: any = {}) => {
    try {
      // Ensure params are properly formatted
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.sort) queryParams.append('sort', params.sort);
      
      const queryString = queryParams.toString();
      const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching users from:', url);
      const response = await api.get<ApiResponse<any>>(url);
      console.log('User response data:', response.data);
      
      // If the response has data.users structure, return it directly
      // Otherwise, wrap the data in the expected structure
      if (response.data.success && response.data.data) {
        if (response.data.data.users) {
          return response.data;
        } else {
          // If data exists but not in users property, restructure it
          return {
            ...response.data,
            data: {
              users: Array.isArray(response.data.data) ? response.data.data : [],
              total: response.data.pagination?.total || 0
            }
          };
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getUsers:', error);
      return handleApiError(error);
    }
  },

  getUserById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  createUser: async (userData: any) => {
    try {
      console.log('Creating user with data:', userData);
      const response = await api.post<ApiResponse<any>>('/admin/users', userData);
      console.log('Create user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      return handleApiError(error);
    }
  },

  updateUser: async (id: string, userData: any) => {
    try {
      const response = await api.put<ApiResponse<any>>(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDashboardStats: async () => {
    try {
      // Use the Next.js API route that proxies to the backend
      const response = await api.get<ApiResponse<any>>('/admin/stats');
      
      if (response.data.success && response.data.data) {
        return response.data;
      } else {
        console.warn('Could not fetch dashboard stats, using defaults');
        // Return default stats if the endpoint is not available
        return {
          success: true,
          data: {
        totalUsers: 0,
        totalTracks: 0,
        pendingTracks: 0,
        pendingPayouts: 0,
        totalRevenue: 0,
        totalReleases: 0,
            pendingReleases: 0
          }
        };
      }
    } catch (error) {
      console.warn('Could not fetch dashboard stats, using defaults:', error);
      // Return default stats if the endpoint is not available
      return {
        success: true,
        data: {
          totalUsers: 0,
          totalTracks: 0,
          pendingTracks: 0,
          pendingPayouts: 0,
          totalRevenue: 0,
          totalReleases: 0,
          pendingReleases: 0
        }
      };
    }
  },

  // Additional admin endpoints
  getTracks: async (params: any = {}) => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/admin/tracks', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getPayouts: async (params: any = {}) => {
    try {
      // Ensure params are properly formatted
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.sort) queryParams.append('sort', params.sort);
      
      const queryString = queryParams.toString();
      const url = `/admin/payouts${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get<ApiResponse<any[]>>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching payouts:', error);
      return { success: false, message: 'Failed to fetch payouts', data: [] };
    }
  },
  
  // Settings management
  getSettings: async () => {
    try {
      const response = await api.get<ApiResponse<any>>('/admin/settings');
      console.log('Settings response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { success: false, message: 'Failed to fetch settings', data: null };
    }
  },
  
  getSetting: async (key: string) => {
    try {
      console.log(`Fetching setting: ${key}`);
      const response = await api.get<ApiResponse<any>>(`/admin/settings/${key}`);
      console.log(`Setting ${key} response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error);
      return { success: false, message: `Failed to fetch setting: ${key}`, data: null };
    }
  },
  
  updateSetting: async (key: string, value: any) => {
    try {
      console.log(`Updating setting ${key} with value:`, value);
      const response = await api.put<ApiResponse<any>>(`/admin/settings/${key}`, { value });
      console.log(`Setting ${key} update response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      return { success: false, message: `Failed to update setting: ${key}`, data: null };
    }
  },
};