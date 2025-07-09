import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  coupleId?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decoded: any = jwtDecode(token);
          setUser({
            id: decoded._id,
            email: decoded.email,
            fullName: decoded.fullName,
            profilePicture: decoded.profilePicture,
            coupleId: decoded.coupleId,
          });
        }
      } catch (err) {
        console.error("Failed to load token", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    const decoded: any = jwtDecode(token);
    setUser({
      id: decoded._id,
      email: decoded.email,
      fullName: decoded.fullName,
      profilePicture: decoded.profilePicture,
      coupleId: decoded.coupleId,
    });
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
