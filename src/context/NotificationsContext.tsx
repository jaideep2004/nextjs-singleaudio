'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { notificationAPI } from '@/services/api';

// Define types
interface Notification {
  _id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

// Create context
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Provider component
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);

  // Initialize on client side only
  useEffect(() => {
    setIsClient(true);
    fetchNotifications();
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications();
      
      if (response.success && response.data) {
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    try {
      await notificationAPI.markAsRead(id);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (typeof window === 'undefined') return; // Skip during SSR
    
    try {
      await notificationAPI.markAllAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Context value
  const contextValue: NotificationsContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };

  // Don't render anything meaningful during SSR
  if (!isClient) {
    return (
      <NotificationsContext.Provider value={contextValue}>
        {children}
      </NotificationsContext.Provider>
    );
  }

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
}

// Custom hook to use the notifications context
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
