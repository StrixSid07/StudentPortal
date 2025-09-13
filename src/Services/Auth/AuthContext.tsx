import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import authService, { User, LoginResponse } from "./authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; message: string }>;
  resetPassword: (
    email: string,
    newPassword: string,
  ) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = authService.getToken();
    const userData = authService.getUser();

    if (token && userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result: LoginResponse = await authService.login(email, password);
      if (result?.login?.success) {
        const { token, user } = result.login;
        authService.setToken(token);
        authService.setUser(user);
        setUser(user);
        setIsAuthenticated(true);
      } else {
        throw new Error(result?.login?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const forgotPassword = async (email: string) => {
    try {
      const result = await authService.forgotPassword(email);
      return {
        success: result?.ForgotPassword?.success || false,
        message: result?.ForgotPassword?.message || "Failed to send OTP",
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const result = await authService.verifyOtp(email, otp);
      return {
        success: result?.verifyotp?.success || false,
        message: result?.verifyotp?.message || "Failed to verify OTP",
      };
    } catch (error) {
      console.error("Verify OTP error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      const result = await authService.resetPassword(email, newPassword);
      return {
        success: result?.ResetPassword?.success || false,
        message: result?.ResetPassword?.message || "Failed to reset password",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
