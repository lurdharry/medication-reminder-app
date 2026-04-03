import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  PropsWithChildren,
} from "react";
import { TokenManager } from "@/services/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthenticated: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = TokenManager.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const setAuthenticated = useCallback((token: string) => {
    TokenManager.setToken(token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    TokenManager.clearToken();
    setIsAuthenticated(false);
  }, []);

  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
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
