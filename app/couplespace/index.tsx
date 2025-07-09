import MemoryGrid from "@/components/MemoryGrid";
import { useCouple } from "@/contexts/CoupleContext";
import { useUser } from "@/contexts/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CoupleSpace() {
  const router = useRouter();
  const { couple, refreshCouple } = useCouple();

  const [cupidScore, setCupidScore] = useState<number | null>(null);
  const [daysTogether, setDaysTogether] = useState<number | null>(null);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchCupidScore = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/achievements`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCupidScore(res.data.cupidScore);
        setDaysTogether(res.data.daysTogether);
        // console.log(couple?.coupleName)
      } catch (error) {
        console.error("Error fetching cupid score:", error);
      }
    };

    fetchCupidScore();
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

  const memories = [
    {
      image: require("../../assets/images/wishlist.jpeg"),
      name: "BucketList",
      onPress: () => router.push("/couplespace/wishlist"),
    },
    {
      image: require("../../assets/images/calendar.jpeg"),
      name: "Calendar",
      onPress: () => router.push("/couplespace/calendar"),
    },
    {
      image: require("../../assets/images/games.jpg"),
      name: "Games",
      onPress: () => router.push("/couplespace/games"),
    },
    {
      image: require("../../assets/images/memory_roadmap.jpeg"),
      name: "Roadmap",
      onPress: () => router.push("/couplespace/roadmap"),
    },
    {
      image: require("../../assets/images/chat.jpeg"),
      name: "Gallery",
      onPress: () => router.push("/couplespace/gallery"),
    },
    {
      image: require("../../assets/images/e.jpg"),
      name: "Photos",
      onPress: () => router.push("/couplespace/photos"),
    },
  ];

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      {/* Top 40% */}
      <View className="absolute top-0 left-0 w-full h-[40%] bg-white/30">
        {/* Profile picture */}
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

        {/* Partner Info */}
        <View className="absolute left-56 top-24 w-auto h-52">
          <Text className="text-amber-900 font-bold text-2xl">
            {couple?.partnerOneName.split(" ")[0]} &{" "}
            {couple?.partnerTwoName.split(" ")[0]}
          </Text>
          <Text className="text-base text-black">
            Days Together: {daysTogether}
          </Text>
          <Text className="text-base text-black">{couple?.coupleName}</Text>
        </View>
      </View>

      {/* Bottom Card */}
      <View className="absolute bottom-0 left-0 w-full h-[75%] bg-white/70 rounded-t-3xl p-4 justify-center">
        {/* Cupid Score Heart */}
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

        {/* Title */}
        <Text className="text-2xl font-semibold text-pink-500 text-center mb-2">
          Couple Space 💕
        </Text>

        {/* Memory Grid */}
        <MemoryGrid memories={memories} />
      </View>
    </ImageBackground>
  );
}
