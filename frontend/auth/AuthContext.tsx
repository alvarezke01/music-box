import React, {
  createContext,
  useContext,
  useEffect,
  useState,
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
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // READ ?access=... FROM URL AFTER SPOTIFY LOGIN
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (Platform.OS === "web") {
          const url = new URL(window.location.href);
          const access = url.searchParams.get("access");

          if (access) {
            // Validate token with backend
            const resp = await fetch(`${API_BASE_URL}/auth/user/`, {
              headers: {
                Authorization: `Bearer ${access}`,
              },
            });

            if (resp.ok) {
              const userData: AuthUser = await resp.json();

              // Store in state
              setUser(userData);
              setAccessToken(access);

              // Remove tokens from URL for cleanliness
              url.search = "";
              window.history.replaceState({}, "", url.toString());
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

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  const isAuthenticated = !!user && !!accessToken;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, accessToken, logout }}
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

