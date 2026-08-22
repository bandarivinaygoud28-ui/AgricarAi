import React, { createContext, useContext, useState, useEffect } from 'react';
import { OwnerProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: OwnerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  register: (data: Partial<OwnerProfile> & { password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<OwnerProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OwnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('agricare_owner_token');
      const cachedUser = localStorage.getItem('agricare_owner_user');
      if (token && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          const fresh = await api.getProfile();
          if (fresh && fresh.id) {
            setUser(fresh);
            localStorage.setItem('agricare_owner_user', JSON.stringify(fresh));
          }
        } catch (e) {
          console.warn('Using cached owner session');
        }
      } else {
        // No authenticated session -> user starts null
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (phone: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(phone, pass);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<OwnerProfile> & { password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const currentId = user?.id;
    localStorage.removeItem('agricare_owner_token');
    localStorage.removeItem('agricare_owner_user');
    if (currentId) {
      localStorage.removeItem(`owner_${currentId}_resources`);
      localStorage.removeItem(`owner_${currentId}_bookings`);
      localStorage.removeItem(`owner_${currentId}_earnings`);
    }
    setUser(null);
  };

  const updateUser = (data: Partial<OwnerProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('agricare_owner_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
