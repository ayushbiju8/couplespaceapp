import MemoryGrid from "@/components/MemoryGrid";
import { useCouple } from "@/contexts/CoupleContext";
import { useUser } from "@/contexts/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { Image, ImageBackground, Text, View } from "react-native";


export default function CoupleSpace() {
  const router = useRouter();
  const { currentUser } = useUser();
  const { couple } = useCouple();

  const [cupidScore, setCupidScore] = useState<number | null>(null);

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
      } catch (error) {
        console.error("Error fetching cupid score:", error);
      }
    };

    fetchCupidScore();
  }, []);
  const total = 100;


  const fillPercent = Math.min((cupidScore || 0 / total) * 100, 100);


  const memories = [
  {
    image: require('../../assets/images/wishlist.jpeg'),
    name: 'BucketList',
    onPress: () => router.push('/couplespace/wishlist'),
  },
  {
    image: require('../../assets/images/calendar.jpeg'),
    name: 'Calendar',
    onPress: () => router.push('/couplespace/calendar'), // ❌ This file doesn't exist
  },
  {
    image: require('../../assets/images/games.jpg'),
    name: 'Games',
    onPress: () => router.push('/couplespace/games'),
  },
  {
    image: require('../../assets/images/memory_roadmap.jpeg'),
    name: 'Roadmap',
    onPress: () => router.push('/couplespace/roadmap'),
  },
  {
    image: require('../../assets/images/chat.jpeg'),
    name: 'Gallery', 
    onPress: () => router.push('/couplespace/gallery'),
  },
  {
    image: require('../../assets/images/e.jpg'),
    name: 'Photos',
    onPress: () => router.push('/couplespace/photos'),
  },
];


  return (
    <ImageBackground
      source={require("../../assets/images/background.jpg")}
      className="flex-1 w-full h-full"
      resizeMode="cover"
    >
      {/* Top 40% profile display */}
      <View className="absolute top-0 left-0 w-full h-[40%] bg-white/30 justify-center items-center">
        <View className="w-60 h-60 rounded-full border-4 border-white shadow-lg overflow-hidden">
          <Image
            source={{ uri: currentUser?.profilePicture }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>



      <View className="absolute bottom-0 left-0 w-full h-[75%] bg-white/70 rounded-t-3xl  p-4 justify-center">
        {/* Cupid Score heart */}
        <View className="absolute top-5 right-5 w-20 h-20 justify-center items-center">

          {/* Outline overlay */}
          <Image
            source={require("../../assets/images/h1.png")}
            className="absolute w-full h-full"
            resizeMode="contain"
          />

          {/* Cupid Score Text */}
          <Text className="text-base font-bold text-black z-10 mr-2">
            {cupidScore ?? 0}
          </Text>
        </View>

        {/* Couple Name */}
        <Text className="text-2xl font-semibold text-pink-500 text-center mb-2">
          {couple?.coupleName}
        </Text>

        <MemoryGrid memories={memories} />
      </View>


    </ImageBackground>
  );
}
