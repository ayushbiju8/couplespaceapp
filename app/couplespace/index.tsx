import { View, Text, Image, ScrollView } from "react-native";
import { useCouple } from "@/contexts/CoupleContext";

export default function CoupleSpace() {
  const { couple, loading } = useCouple();

  if (loading) return <Text>Loading...</Text>;
  if (!couple) return <Text>No couple data found.</Text>;

  return (
    <ScrollView className="p-4">
      <Image
        source={{ uri: couple.coverPhoto }}
        style={{ height: 180, borderRadius: 12 }}
        resizeMode="cover"
      />
      <Text className="text-2xl mt-3 font-bold text-pink-500">{couple.coupleName}</Text>

      <View className="mt-4">
        <Text className="font-semibold">👫 {couple.partnerOneName} & {couple.partnerTwoName}</Text>
        <Text>🛍 Wishlist items: {couple.wishlist.length}</Text>
        <Text>🚗 Roadmap goals: {couple.roadmap.length}</Text>
        <Text>📅 Calendar events: {couple.calendar.length}</Text>
        <Text>🖼 Memories: {couple.memories.length}</Text>
      </View>
    </ScrollView>
  );
}
