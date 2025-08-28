import MemoryGrid from "@/components/MemoryGrid";
import { useCouple } from "@/contexts/CoupleContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CoupleSpace() {
  const router = useRouter();
  const { couple, refreshCouple } = useCouple();

  const [status, setStatus] = useState<"loading" | "none" | "pending" | "active">("loading");
  const [cupidScore, setCupidScore] = useState<number | null>(null);
  const [daysTogether, setDaysTogether] = useState<number | null>(null);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // form states
  const [coupleName, setCoupleName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/user-homepage`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.data?.haveCoupleSpace) {
          setStatus("active");
          await refreshCouple();

          const achRes = await axios.get(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/achievements`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCupidScore(achRes.data.cupidScore);
          setDaysTogether(achRes.data.daysTogether);
        } else if (res.data.data?.isRequestPending) {
          setStatus("pending");
        } else {
          setStatus("none");
        }
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    };

    fetchStatus();
  }, []);

  const handleProfileImagePress = () => {
    setShowEditIcon(true);
    setTimeout(() => setShowEditIcon(false), 3000);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];
      const uri = image.uri;
      const fileName = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(fileName || "");
      const fileType = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append("coverPhoto", {
        uri,
        name: fileName,
        type: fileType,
      } as any);

      try {
        setIsUploading(true);
        const token = await AsyncStorage.getItem("token");
        await axios.post(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/update-coverphoto`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        await refreshCouple();
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const createCoupleSpace = async () => {
    setError("");
    if (!coupleName) {
      setError("Couple Space Name is required");
      return;
    }
    if (!partnerEmail) {
      setError("Partner Email is required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const formData = new FormData();
      formData.append("coupleName", coupleName);
      formData.append("partnerTwoEmail", partnerEmail);

      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/create-couple-space`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Invite sent successfully!");
      setCoupleName("");
      setPartnerEmail("");
      setStatus("pending");
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("User already in a Couple Space.");
      } else {
        setError(err.response?.data?.message || "Something went wrong.");
      }
    }
  };

  const acceptInvite = async () => {
    setError("");
    if (!inviteToken) {
      setError("Invitation token is required");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/accept-invite`,
        { token: inviteToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Couple Space created!");
      setInviteToken("");
      setStatus("active");
      await refreshCouple();
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired token.");
    }
  };

  // ---------------------- UI ----------------------
  if (status === "loading") {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  if (status === "none") {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <View className="w-full max-w-md">
          <Text className="text-2xl font-bold text-pink-600 mb-6 text-center">
            Couple Space 💞
          </Text>

          {/* Create couple space by email */}
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
            placeholder="Couple Space Name"
            value={coupleName}
            onChangeText={setCoupleName}
          />

          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
            placeholder="Partner's Email"
            value={partnerEmail}
            onChangeText={setPartnerEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TouchableOpacity
            onPress={createCoupleSpace}
            className="bg-pink-500 rounded-xl py-3 mb-6"
          >
            <Text className="text-white text-center font-bold text-lg">
              Send Invite
            </Text>
          </TouchableOpacity>

          {/* OR accept invite with token */}
          <Text className="text-center text-gray-500 mb-3">— OR —</Text>

          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-3"
            placeholder="Paste Invitation Token"
            value={inviteToken}
            onChangeText={setInviteToken}
            autoCapitalize="none"
          />

          {error ? (
            <Text className="text-red-500 mb-3 text-center">{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={acceptInvite}
            className="bg-green-500 rounded-xl py-3"
          >
            <Text className="text-white text-center font-bold text-lg">
              Accept Invite
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (status === "pending") {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl font-semibold text-gray-700">
          💌 Your Couple Space request is pending...
        </Text>
      </View>
    );
  }

  // ACTIVE couple space (your original UI)
  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      {/* Top 40% */}
      <View className="absolute top-0 left-0 w-full h-[40%] bg-white/30">
        <TouchableOpacity
          onPress={handleProfileImagePress}
          activeOpacity={0.9}
          className="w-52 h-52 rounded-full border-4 border-white shadow-lg overflow-hidden absolute top-10 left-0 justify-center items-center"
        >
          {isUploading ? (
            <ActivityIndicator size="large" color="#ff69b4" />
          ) : (
            <>
              <Image
                source={{ uri: couple?.coverPhoto }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {showEditIcon && (
                <TouchableOpacity
                  onPress={handleImagePick}
                  className="absolute bottom-6 right-6 bg-white p-2 rounded-full shadow-md z-50"
                >
                  <Ionicons name="pencil" size={20} color="#ff69b4" />
                </TouchableOpacity>
              )}
            </>
          )}
        </TouchableOpacity>

        <View className="absolute left-56 top-24 w-auto h-52">
          <Text className="text-amber-900 font-bold text-2xl">
            {couple?.partnerOneName?.split(" ")[0]} &{" "}
            {couple?.partnerTwoName?.split(" ")[0]}
          </Text>
          <Text className="text-base text-black">Days Together: {daysTogether}</Text>
          <Text className="text-base text-black">{couple?.coupleName}</Text>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 w-full h-[75%] bg-white/70 rounded-t-3xl p-4 justify-center">
        <View className="absolute top-5 right-5 w-20 h-20 justify-center items-center">
          <Image
            source={require("../../assets/images/h1.png")}
            className="absolute w-full h-full"
            resizeMode="contain"
          />
          <Text className="text-base font-bold text-black z-10 mr-2">
            {cupidScore ?? 0}
          </Text>
        </View>

        <Text className="text-2xl font-semibold text-pink-500 text-center mb-2">
          Couple Space 💕
        </Text>

        <MemoryGrid
          memories={[
            { image: require("../../assets/images/wishlist.jpeg"), name: "BucketList", onPress: () => router.push("/couplespace/wishlist") },
            { image: require("../../assets/images/calendar.jpeg"), name: "Calendar", onPress: () => router.push("/couplespace/calendar") },
            { image: require("../../assets/images/games.jpg"), name: "Games", onPress: () => router.push("/couplespace/games") },
            { image: require("../../assets/images/memory_roadmap.jpeg"), name: "Roadmap", onPress: () => router.push("/couplespace/roadmap") },
            { image: require("../../assets/images/chat.jpeg"), name: "Gallery", onPress: () => router.push("/couplespace/gallery") },
            { image: require("../../assets/images/e.jpg"), name: "Photos", onPress: () => router.push("/couplespace/photos") },
          ]}
        />
      </View>
    </ImageBackground>
  );
}
