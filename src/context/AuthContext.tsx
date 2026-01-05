import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import apiClient, { setupInterceptors } from '../lib/api';
import type { User } from '../types';
import { unwrapResponse } from '../lib/api';

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  isLoadingAuth: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithQr: (userId: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
  loadUserFromStorage: () => Promise<void>;
};

const AUTH_STORAGE_KEY = 'trainme.auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const persistAuth = useCallback((payload: AuthResponse | null) => {
    if (payload) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const applyAuthState = useCallback(
    (payload: AuthResponse | null) => {
      setUser(payload?.user ?? null);
      setAccessToken(payload?.accessToken ?? null);
      persistAuth(payload);
    },
    [persistAuth],
  );

  const logout = useCallback(() => {
    applyAuthState(null);
  }, [applyAuthState]);

  const refreshToken = useCallback(async () => {
    // Read directly from storage to avoid stale state issues
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      logout();
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as AuthResponse;
      if (!parsed.refreshToken) {
        logout();
        return null;
      }

      const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
        refreshToken: parsed.refreshToken,
      }, {
        skipAuthRefresh: true,
      });

      const payload = unwrapResponse<AuthResponse>(response.data);

      if (payload.accessToken) {
        applyAuthState(payload);
        return payload.accessToken;
      }

      return null;
    } catch (error) {
      logout();
      return null;
    }
  }, [applyAuthState, logout]);

  const loadUserFromStorage = useCallback(async () => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!stored) {
      setIsLoadingAuth(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as AuthResponse;
      applyAuthState(parsed);
      // Manually update ref to ensure interceptor has token immediately
      accessTokenRef.current = parsed.accessToken;

      const response = await apiClient.get<User>('/api/users/me');

      const remoteUser = unwrapResponse<User>(response.data);

      // Preserve the existing tokens while updating user data
      applyAuthState({
        user: remoteUser,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken
      });
    } catch {
      // If the initial load fails (e.g. 401), the interceptor might have tried to refresh.
      // If it still fails, we might want to logout, OR let the interceptor handle it.
      // But if loadUserFromStorage throws, it means even refresh failed (if interceptor was active).
      // However, we removed skipAuthRefresh, so interceptor SHOULD try.
      // If it eventually fails, we catch here.
      applyAuthState(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [applyAuthState]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoadingAuth(true);
      try {
        const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
        const payload = unwrapResponse<AuthResponse>(response.data);
        applyAuthState(payload);
      } catch (error) {
        throw error;
      } finally {
        setIsLoadingAuth(false);
      }
    },
    [applyAuthState],
  );

  const loginWithQr = useCallback(
    async (userId: string) => {
      setIsLoadingAuth(true);
      try {
        const response = await apiClient.post<AuthResponse>('/api/auth/qr-login', { userId });
        const payload = unwrapResponse<AuthResponse>(response.data);
        applyAuthState(payload);
      } catch (error) {
        throw error;
      } finally {
        setIsLoadingAuth(false);
      }
    },
    [applyAuthState],
  );

  useEffect(() => {
    const ejectInterceptors = setupInterceptors({
      getAccessToken: () => accessTokenRef.current,
      refreshToken,
      onLogout: logout,
    });

    // Load user only AFTER interceptors are set up
    loadUserFromStorage();

    return ejectInterceptors;
  }, [logout, refreshToken, loadUserFromStorage]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoadingAuth,
      login,
      loginWithQr,
      logout,
      refreshToken,
      loadUserFromStorage,
    }),
    [accessToken, isLoadingAuth, loadUserFromStorage, login, logout, refreshToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
