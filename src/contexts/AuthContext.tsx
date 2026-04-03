import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  PropsWithChildren,
} from "react";
import { TokenManager } from "@/services/api";
import { userApi, UserProfile } from "@/services/api/userApi";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  setAuthenticated: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = TokenManager.getToken();
      if (token) {
        try {
          const response = await userApi.getProfile();
          setUser(response.data.data);
          setIsAuthenticated(true);
        } catch {
          TokenManager.clearToken();
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const setAuthenticated = useCallback(async (token: string) => {
    TokenManager.setToken(token);
    try {
      const response = await userApi.getProfile();
      setUser(response.data.data);
    } catch {
      setUser(null);
    }
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    TokenManager.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    setAuthenticated,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
