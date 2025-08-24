import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const IMAGE_SIZE = width / NUM_COLUMNS - 12;

type MemoryImage = {
  _id: string;
  url: string;
  fileType: string;
  uploadedAt: string;
};

export default function Photos() {
  const [images, setImages] = useState<MemoryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const getToken = async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return null;
    }
    return token;
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/getmemory`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setImages(res.data.data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      Alert.alert("Error", "Failed to fetch images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
  };

  const pickAndUploadImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission denied", "Media library permission is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (result.canceled || !result.assets.length) return;

      const imageUri = result.assets[0].uri;

      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Not logged in");
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append("memoryPhoto", {
        uri: imageUri,
        name: `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/uploadmemory`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Success", "Image uploaded successfully!");
      fetchImages();
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload failed", "Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: { item: MemoryImage }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className="m-1 rounded-xl overflow-hidden bg-pink-100 shadow-md shadow-pink-400"
      style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
      onPress={() => {
        setSelectedImageUrl(item.url);
        setModalVisible(true);
      }}
    >
      <Image
        source={{ uri: item.url }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-pink-50 pt-12">
      <Text className="text-3xl font-extrabold text-center text-pink-700 mb-4 drop-shadow-md">
        💖 Memory Photos
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#d11c84"
          style={{ marginTop: 20 }}
        />
      ) : images.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-pink-700 text-lg text-center">
            No photos yet — start capturing beautiful moments!
          </Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#b3005e"
              colors={["#b3005e"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Image Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-pink-600 w-14 h-14 rounded-full justify-center items-center shadow-lg shadow-pink-700"
        onPress={pickAndUploadImage}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-4xl leading-none">＋</Text>
        )}
      </TouchableOpacity>

      {/* Full Screen Image Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/80 justify-center items-center">
          <TouchableOpacity
            style={{ width: "100%", height: "100%" }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: selectedImageUrl || undefined }}
              className="w-[100%] h-[100%] rounded-xl"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
