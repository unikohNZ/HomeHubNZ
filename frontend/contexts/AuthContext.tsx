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
import { DemoRole } from "../types";
import { User, UserRole } from "../types/user";
import { authStorage } from "../utils/authStorage";
import { tokenStorage } from "../src/services/tokenStorage";

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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function makeToken(userId: string) {
  return `hh_token_${userId}_${Date.now()}`;
}

function roleToDemoRole(role: UserRole): DemoRole {
  return role === "landlord" ? "landlord" : "flatmate";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
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

  const login = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      const demoUser = validateDemoLogin(email, password);
      if (!demoUser) {
        throw new Error("Invalid email or password. Try the demo accounts.");
      }
      const token = makeToken(demoUser.id);
      await tokenStorage.setTokens(token, token);
      if (rememberMe) {
        await authStorage.saveSession(demoUser, token, true);
      } else {
        await authStorage.clearSession();
        await authStorage.setRememberMe(false);
      }
      setUser(demoUser);
    },
    [],
  );

  const register = useCallback(async (input: RegisterInput) => {
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
    const token = makeToken(newUser.id);
    await tokenStorage.setTokens(token, token);
    await authStorage.saveSession(newUser, token, true);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await authStorage.clearSession();
    await tokenStorage.clearTokens();
    setUser(null);
  }, []);

  const switchRole = useCallback(
    async (role: DemoRole) => {
      if (!user) return;
      const next: User =
        role === "landlord"
          ? { ...LANDLORD_USER, email: user.email, name: user.name }
          : { ...FLATMATE_USER, email: user.email, name: user.name };
      const token = makeToken(next.id);
      await tokenStorage.setTokens(token, token);
      const remember = await authStorage.getSession();
      if (remember) {
        await authStorage.saveSession(next, token, true);
      }
      setUser(next);
    },
    [user],
  );

  const forgotPassword = useCallback(async (_email: string) => {
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
    }),
    [user, isLoading, login, register, logout, switchRole, forgotPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
