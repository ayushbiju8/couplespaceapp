import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-300">
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    )
  }
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
