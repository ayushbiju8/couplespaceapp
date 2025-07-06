import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

// User type matching token payload
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
  login: (token: string, userData?: User) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decodedUser: any = jwtDecode(token);

          const userObj: User = {
            id: decodedUser._id,
            email: decodedUser.email,
            fullName: decodedUser.fullName,
            profilePicture: decodedUser.profilePicture,
            coupleId: decodedUser.coupleId,
          };

          setUser(userObj);
        }
      } catch (error) {
        console.error("Failed to load token", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromToken();
  }, []);

  const login = async (token: string, userData?: User) => {
    await AsyncStorage.setItem("token", token);

    if (userData) {
      // Prefer explicitly passed user
      setUser(userData);
    } else {
      const decodedUser: any = jwtDecode(token);
      const userObj: User = {
        id: decodedUser._id,
        email: decodedUser.email,
        fullName: decodedUser.fullName,
        profilePicture: decodedUser.profilePicture,
        coupleId: decodedUser.coupleId,
      };
      setUser(userObj);
    }
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
