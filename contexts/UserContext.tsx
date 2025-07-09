import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export type CurrentUser = {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  profilePicture?: string;
  coupleId?: string;
  dob?: string;
  interests?: string[];
  createdAt: string;
  updatedAt: string;
};

type UserContextType = {
  currentUser: CurrentUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/current-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = res.data.data;
      setCurrentUser(user);
      await AsyncStorage.setItem("cachedUser", JSON.stringify(user));
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const cached = await AsyncStorage.getItem("cachedUser");
        if (cached) setCurrentUser(JSON.parse(cached));
      } catch (err) {
        console.error("Failed to load cached user:", err);
      }
      fetchUser();
    };
    init();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
