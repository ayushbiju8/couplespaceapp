import { Stack } from "expo-router";
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext";
import { CoupleProvider } from "@/contexts/CoupleContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CoupleProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CoupleProvider>
    </AuthProvider>
  );
}
