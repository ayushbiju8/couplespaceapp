import React from 'react';
import {
  Image,
  Text,
  View,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';


type Memory = {
  image: ImageSourcePropType;
  name: string;
  onPress?: () => void; // Optional click handler
};

type Props = {
  memories: Memory[];
};

const MemoryGrid: React.FC<Props> = ({ memories }) => {
  const rows = Math.ceil(memories.length / 2);

  return (
    <View className="mt-10 space-y-10 gap-10">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-around">
          {[0, 1].map((colIndex) => {
            const index = rowIndex * 2 + colIndex;
            const memory = memories[index];
            if (!memory) return <View key={colIndex} className="w-32" />;

            return (
              <TouchableOpacity
                key={colIndex}
                className="items-center"
                onPress={memory.onPress}
                activeOpacity={0.8}
              >
                <Image
                  source={memory.image}
                  className="w-32 h-32 rounded-full border-2 border-pink-300 shadow-md"
                  resizeMode="cover"
                />
                <Text className="text-base text-gray-700 mt-1 font-bold roboto">
                  {memory.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default MemoryGrid;
