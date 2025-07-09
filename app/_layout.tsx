import { Stack } from "expo-router";
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext";
import { CoupleProvider } from "@/contexts/CoupleContext";
import { UserProvider } from "@/contexts/UserContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <CoupleProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </CoupleProvider>
      </UserProvider>
    </AuthProvider>
  );
}
