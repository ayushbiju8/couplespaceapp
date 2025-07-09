import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { useCouple } from "@/contexts/CoupleContext";

export default function LoginScreen() {
  const {refreshCouple}=useCouple()
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/login`, {
        email,
        password,
      });

      const { accessToken, user } = res.data.data;

      // Save token and decoded user
      await login(accessToken);
      // refreshCouple()
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login Failed", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-8 text-pink-600">Welcome Back 💖</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-6"
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <Pressable
        onPress={handleLogin}
        className="w-full bg-pink-500 py-3 rounded-xl mb-3"
        disabled={loading}
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </Pressable>

      <Text className="text-sm text-gray-500">
        Don't have an account?{" "}
        <Text
          className="text-pink-600 font-semibold"
          onPress={() => router.push("/signup")}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
}
