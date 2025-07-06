import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Memory = {
  _id: string;
  url: string;
  fileType: "image" | "video";
  uploadedAt: string;
};

export type CoupleData = {
  _id: string;
  coupleName: string;
  coverPhoto?: string;
  wishlist: string[];
  achievements: string[];
  calendar: string[];
  roadmap: string[];
  memories: Memory[];
  partnerOneName: string;
  partnerTwoName: string;
  partnerOneProfilePicture: string;
  partnerTwoProfilePicture: string;
};

type CoupleContextType = {
  couple: CoupleData | null;
  loading: boolean;
  setCouple: (data: CoupleData | null) => void;
  refreshCouple: () => void;
};

const CoupleContext = createContext<CoupleContextType | null>(null);

type Props = {
  children: ReactNode;
};

export const CoupleProvider = ({ children }: Props) => {
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCouple = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/couple-space`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCouple(res.data.data);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Failed to fetch couple:", err.message);
      } else {
        console.error("Unknown error while fetching couple:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouple();
  }, []);

  return (
    <CoupleContext.Provider value={{ couple, loading, setCouple, refreshCouple: fetchCouple }}>
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (!context) throw new Error("useCouple must be used within CoupleProvider");
  return context;
};
