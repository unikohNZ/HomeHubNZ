import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { validateDemoLogin } from "../data/demoAccounts";
import { FLATMATE_USER, LANDLORD_USER } from "../data/mockUsers";
import { queryClient } from "../src/lib/queryClient";
import api from "../src/services/api";
import { tokenStorage } from "../src/services/tokenStorage";
import { isMockMode } from "../src/utils/dataSource";
import { DemoRole } from "../types";
import { User, UserRole } from "../types/user";
import { authStorage } from "../utils/authStorage";

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "flatmate" | "landlord";
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: DemoRole) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapApiUser(data: {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  role: string;
}): User {
  const role: UserRole =
    data.role === "landlord" || data.role === "property_manager" ? "landlord" : "flatmate";
  return {
    id: String(data.id),
    name: `${data.first_name} ${data.last_name}`.trim(),
    email: data.email,
    role,
    avatar_color: role === "landlord" ? "#22c55e" : "#3b82f6",
    avatar_url: data.avatar_url ?? undefined,
    location: "New Zealand",
    verified: true,
  };
}

function roleToDemoRole(role: UserRole): DemoRole {
  return role === "landlord" ? "landlord" : "flatmate";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!isMockMode()) {
        const token = await tokenStorage.getAccessToken();
        if (token && token !== "demo-token") {
          try {
            const { data } = await api.get("/auth/me");
            if (!active) return;
            const mapped = mapApiUser(data);
            setUser(mapped);
            setIsLoading(false);
            return;
          } catch {
            await tokenStorage.clearTokens();
          }
        }
      }

      const session = await authStorage.getSession();
      if (!active) return;
      if (session) {
        setUser(session.user);
        await tokenStorage.setTokens(session.token, session.token);
      }
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    if (!isMockMode()) {
      const { data: tokens } = await api.post<{ access_token: string; refresh_token: string }>(
        "/auth/login",
        { email, password },
      );
      await tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
      const { data: me } = await api.get("/auth/me");
      const mapped = mapApiUser(me);
      if (rememberMe) {
        await authStorage.saveSession(mapped, tokens.access_token, true);
      } else {
        await authStorage.clearSession();
        await authStorage.setRememberMe(false);
      }
      setUser(mapped);
      await queryClient.invalidateQueries();
      return;
    }

    const demoUser = validateDemoLogin(email, password);
    if (!demoUser) {
      throw new Error("Invalid email or password. Try the demo accounts.");
    }
    const token = `hh_token_${demoUser.id}_${Date.now()}`;
    await tokenStorage.setTokens(token, token);
    if (rememberMe) {
      await authStorage.saveSession(demoUser, token, true);
    } else {
      await authStorage.clearSession();
      await authStorage.setRememberMe(false);
    }
    setUser(demoUser);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    if (!isMockMode()) {
      const { data } = await api.post("/auth/register", {
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        password: input.password,
        phone: input.phone,
        role: input.role === "landlord" ? "landlord" : "tenant",
      });
      const mapped = mapApiUser(data);
      setUser(mapped);
      return;
    }

    if (input.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    const base = input.role === "landlord" ? LANDLORD_USER : FLATMATE_USER;
    const newUser: User = {
      ...base,
      id: `u_${Date.now()}`,
      name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      verified: false,
    };
    const token = `hh_token_${newUser.id}_${Date.now()}`;
    await tokenStorage.setTokens(token, token);
    await authStorage.saveSession(newUser, token, true);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    if (!isMockMode()) {
      try {
        await api.post("/auth/logout");
      } catch {
        // ignore
      }
    }
    await authStorage.clearSession();
    await tokenStorage.clearTokens();
    setUser(null);
    queryClient.clear();
  }, []);

  const switchRole = useCallback(
    async (role: DemoRole) => {
      if (!user) return;
      if (!isMockMode()) {
        showToastNotAvailable();
        return;
      }
      const next: User =
        role === "landlord"
          ? { ...LANDLORD_USER, email: user.email, name: user.name, avatar_url: user.avatar_url }
          : { ...FLATMATE_USER, email: user.email, name: user.name, avatar_url: user.avatar_url };
      const token = `hh_token_${next.id}_${Date.now()}`;
      await tokenStorage.setTokens(token, token);
      const remember = await authStorage.getSession();
      if (remember) {
        await authStorage.saveSession(next, token, true);
      }
      setUser(next);
    },
    [user],
  );

  const forgotPassword = useCallback(async (email: string) => {
    if (!isMockMode()) {
      await api.post("/auth/forgot-password", { email });
      return;
    }
    await new Promise((r) => setTimeout(r, 600));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      switchRole,
      forgotPassword,
      updateUser,
    }),
    [user, isLoading, login, register, logout, switchRole, forgotPassword, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function showToastNotAvailable() {
  // Role switch is demo-only; no-op in API mode
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useDemoRole(): DemoRole {
  const { user } = useAuth();
  if (!user) return "flatmate";
  return roleToDemoRole(user.role);
}
