import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { MOCK_USER } from "@/data/mockData";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = "mock_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync(USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored) as User);
      }
      setIsLoading(false);
    })();
  }, []);

  const persistUser = useCallback(async (nextUser: User) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const mockUser: User = {
      ...MOCK_USER,
      email,
    };
    await persistUser(mockUser);
  };

  const register = async (data: RegisterData) => {
    await new Promise((r) => setTimeout(r, 800));
    const mockUser: User = {
      ...MOCK_USER,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: data.role || "tenant",
    };
    await persistUser(mockUser);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
