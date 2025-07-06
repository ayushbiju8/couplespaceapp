import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const Index = () => {
  const { user,logout } = useAuth();
  const router = useRouter()

  if (!user) {
    return (
      <View className="p-4">
        <Text>Not logged in.</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <View className="p-4">
      <Text className="text-xl font-bold">Welcome, {user.fullName}!</Text>
      <Text>Email: {user.email}</Text>

      {user.profilePicture && (
        <Image
          source={{ uri: user.profilePicture }}
          style={{ width: 100, height: 100, borderRadius: 50, marginTop: 10 }}
        />
      )}

      {user.coupleId && <Text>Couple ID: {user.coupleId}</Text>}

      <TouchableOpacity onPress={handleLogout}>
        <View className="w-full h-10 bg-red-500 rounded justify-center items-center" >
          <Text>
            Log Out
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Index;

