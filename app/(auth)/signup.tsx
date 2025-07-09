import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fullName, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed.");
      }

      const { accessToken, user } = data.data;
      await login(accessToken, user); // ✅ Pass both token and user
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Signup Error", err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-8 text-pink-600">Create Account 💕</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
        placeholder="Full Name"
        onChangeText={setFullName}
        value={fullName}
      />
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
        onPress={handleSignup}
        className="w-full bg-pink-500 py-3 rounded-xl mb-3"
        disabled={loading}
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? "Creating..." : "Sign Up"}
        </Text>
      </Pressable>

      <Text className="text-sm text-gray-500">
        Already have an account?{" "}
        <Text
          className="text-pink-600 font-semibold"
          onPress={() => router.push("/login")}
        >
          Log in
        </Text>
      </Text>
    </View>
  );
}
