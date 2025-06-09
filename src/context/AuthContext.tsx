'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage';

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

type UserMembership = {
  id: string;
  membership: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  status: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
  userMemberships: UserMembership[];
  register: (email: string, password: string, name?: string) => Promise<void>;
  updateUserProfile: (updatedUser: Partial<User>) => void;
  checkMembershipStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getStorageItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Ensure the token is also in the cookie for middleware
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

        const decoded = jwtDecode<User>(token);
        setUser(decoded);
      } catch (error) {
        console.error('Auth error:', error);
        removeStorageItem('auth_token');
        // Clear any potential cookie as well
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Check membership status when user changes
  useEffect(() => {
    if (user) {
      checkMembershipStatus();
    }
  }, [user]);

  const checkMembershipStatus = async () => {
    try {
      const token = getStorageItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/user/membership', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserMemberships(data.memberships || []);
      }
    } catch (error) {
      console.error('Failed to fetch membership status:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      setStorageItem('auth_token', data.token);
      
      // Also store token in cookie for middleware authentication
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      
      setUser(jwtDecode<User>(data.token));
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeStorageItem('auth_token');
    
    // Also remove the auth cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    setUser(null);
    setUserMemberships([]);
    router.push('/');
    router.refresh();
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Registration failed');
    }

    const data = await response.json();
    setStorageItem('auth_token', data.token);
    setUser(jwtDecode<User>(data.token));
  };

  const updateUserProfile = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  // Check if user has active membership
  const isMember = userMemberships.some(membership => 
    membership.status === 'ACTIVE' && 
    new Date(membership.endDate) > new Date()
  );

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isMember,
    userMemberships,
    register,
    updateUserProfile,
    checkMembershipStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
 