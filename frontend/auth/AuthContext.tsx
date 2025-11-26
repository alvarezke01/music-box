import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Platform } from "react-native";
import { API_BASE_URL } from "../config";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  display_name: string;
  spotify_id: string | null;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  setTokens: (access: string | null, refresh: string | null) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // READ ?access=... FROM URL AFTER SPOTIFY LOGIN
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (Platform.OS === "web") {
          const url = new URL(window.location.href);
          const accessFromUrl = url.searchParams.get("access");
          const refreshFromUrl = url.searchParams.get("refresh");

          // Helper to persist tokens to localStorage
          const persist = (access: string | null, refresh: string | null) => {
            try {
              if (access) localStorage.setItem("accessToken", access);
              else localStorage.removeItem("accessToken");

              if (refresh) localStorage.setItem("refreshToken", refresh);
              else localStorage.removeItem("refreshToken");
            } catch (e) {
              console.warn("Could not access localStorage", e);
            }
          };

          if (accessFromUrl) {
            // Persist and validate
            persist(accessFromUrl, refreshFromUrl);
            setAccessToken(accessFromUrl);
            setRefreshToken(refreshFromUrl);

            // Validate token with backend and fetch user
            const resp = await fetch(`${API_BASE_URL}/auth/user/`, {
              headers: {
                Authorization: `Bearer ${accessFromUrl}`,
              },
            });

            if (resp.ok) {
              const userData: AuthUser = await resp.json();
              setUser(userData);
            } else {
              // token from URL not valid: clear
              persist(null, null);
              setAccessToken(null);
              setRefreshToken(null);
            }

            // Remove tokens from URL
            url.searchParams.delete("access");
            url.searchParams.delete("refresh");
            window.history.replaceState({}, "", url.toString());
          } else {
            // No tokens in URL, try to load from storage
            try {
              const storedAccess = localStorage.getItem("accessToken");
              const storedRefresh = localStorage.getItem("refreshToken");

              if (storedAccess) {
                setAccessToken(storedAccess);
                setRefreshToken(storedRefresh);

                const resp = await fetch(`${API_BASE_URL}/auth/user/`, {
                  headers: {
                    Authorization: `Bearer ${storedAccess}`,
                  },
                });

                if (resp.ok) {
                  const userData: AuthUser = await resp.json();
                  setUser(userData);
                } else {
                  // stored token invalid, clear storage
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  setAccessToken(null);
                  setRefreshToken(null);
                }
              }
            } catch (e) {
              console.warn("Could not read tokens from storage", e);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const setTokens = useCallback(async (access: string | null, refresh: string | null) => {
    if (Platform.OS === "web") {
      try {
        if (access) localStorage.setItem("accessToken", access);
        else localStorage.removeItem("accessToken");

        if (refresh) localStorage.setItem("refreshToken", refresh);
        else localStorage.removeItem("refreshToken");
      } catch (e) {
        console.warn("Could not persist tokens to localStorage", e);
      }
    }

    setAccessToken(access);
    setRefreshToken(refresh);
  }, []);

  const logout = useCallback(() => {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } catch (e) {
        console.warn("Could not clear localStorage during logout", e);
      }
    }

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  const isAuthenticated = !!user && !!accessToken;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, accessToken, setTokens, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

