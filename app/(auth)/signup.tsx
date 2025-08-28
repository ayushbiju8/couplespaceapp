import axios from "axios";
import Checkbox from "expo-checkbox";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ask for media library permissions once
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "We need access to your photos to upload a profile picture.");
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    // Basic validations
    if (!terms) return Alert.alert("Error", "You need to agree to our Terms and Conditions.");
    if (!fullName.trim()) return Alert.alert("Error", "Full name is required.");
    if (!userName.trim()) return Alert.alert("Error", "Username is required.");
    if (!email.trim()) return Alert.alert("Error", "Email is required.");
    if (!password) return Alert.alert("Error", "Password is required.");

    // normalize to lowercase (instead of just blocking)
    const normalizedUserName = userName.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("userName", normalizedUserName);
      formData.append("email", normalizedEmail);
      formData.append("password", password);

      if (image) {
        const filename = image.split("/").pop() || `profile_${Date.now()}.jpg`;
        const ext = filename.includes(".") ? filename.split(".").pop() : "jpg";
        const type = `image/${ext}`;
        formData.append(
          "profilePicture",
          {
            uri: image,
            name: filename,
            type,
          } as any
        );
      }

      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/register`,
        formData,
        {
          // Let axios/RN set the correct boundary header automatically:
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Do NOT call login() here — register does not return a token.
      // This avoids the AsyncStorage "undefined value" error.
      setFullName("");
      setUserName("");
      setEmail("");
      setPassword("");
      setTerms(false);
      setImage(null);

      Alert.alert("Success", "Account created. Please log in.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";
      Alert.alert("Signup Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-6 text-pink-600">Create Account 💕</Text>

      {/* Profile Image Upload */}
      <TouchableOpacity
        onPress={pickImage}
        className="mb-6 w-24 h-24 rounded-full overflow-hidden border-2 border-pink-400"
        disabled={loading}
      >
        {image ? (
          <Image source={{ uri: image }} className="w-full h-full" />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400 text-xs text-center px-2">Upload Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
        placeholder="Full Name"
        onChangeText={setFullName}
        value={fullName}
        editable={!loading}
      />
      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
        placeholder="Username (lowercase)"
        autoCapitalize="none"
        onChangeText={setUserName}
        value={userName}
        editable={!loading}
      />
      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-3"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
        editable={!loading}
      />
      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4"
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
        editable={!loading}
      />

      {/* Terms & Conditions */}
      <View className="flex-row items-center mb-4">
        <Checkbox value={terms} onValueChange={setTerms} color="#ec4899" disabled={loading} />
        <Text className="ml-2 text-gray-600">Agree to Terms & Conditions</Text>
      </View>

      <Pressable
        onPress={handleSignup}
        className={`w-full py-3 rounded-xl mb-3 ${loading ? "bg-pink-300" : "bg-pink-500"}`}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">Sign Up</Text>
        )}
      </Pressable>

      <Text className="text-sm text-gray-500">
        Already have an account?{" "}
        <Text className="text-pink-600 font-semibold" onPress={() => router.push("/login")}>
          Log in
        </Text>
      </Text>
    </View>
  );
}
