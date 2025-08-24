// WishlistScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

/**
 * Uses your routes:
 * GET    /couples/getWish          -> response: { statusCode, data: [...] }
 * POST   /couples/addWish          -> body: { item }
 * PUT    /couples/editWish         -> body: { wishlistItemId, item, status }
 * DELETE /couples/deleteWish       -> body: { wishlistItemId }  (send as axios.delete(..., { data: {...} }))
 */

type Wish = {
  _id: string;
  item: string;
  status: "pending" | "completed";
  createdAt?: string;
  updatedAt?: string;
};

const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples`;

function getErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || err.message;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

export default function WishlistScreen() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [newWishText, setNewWishText] = useState<string>("");

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [editStatus, setEditStatus] = useState<"pending" | "completed">("pending");

  // helper to get token
  const getToken = async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return null;
    }
    return token;
  };

  // Fetch all wishlist items
  const fetchWishes = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE}/getWish`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // backend returns data in res.data.data
      const data = res.data?.data || [];
      setWishes(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Fetch wishes error:", msg);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  // Add a new wish
  const addWish = async () => {
    const text = newWishText.trim();
    if (!text) return Alert.alert("Empty", "Please enter something to add.");

    try {
      const token = await getToken();
      if (!token) return;

      await axios.post(
        `${BASE}/addWish`,
        { item: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewWishText("");
      // refresh
      await fetchWishes();
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Add wish error:", msg);
      Alert.alert("Error", msg);
    }
  };

  // Toggle status between pending/completed
  const toggleStatus = async (wish: Wish) => {
    const newStatus: "pending" | "completed" = wish.status === "pending" ? "completed" : "pending";

    try {
      const token = await getToken();
      if (!token) return;

      await axios.put(
        `${BASE}/editWish`,
        { wishlistItemId: wish._id, item: wish.item, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishes((prev) => prev.map((w) => (w._id === wish._id ? { ...w, status: newStatus } : w)));
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Toggle status error:", msg);
      Alert.alert("Error", msg);
    }
  };

  // Open edit modal
  const openEdit = (wish: Wish) => {
    setEditingWish(wish);
    setEditText(wish.item);
    setEditStatus(wish.status);
    setEditModalVisible(true);
  };

  // Save edit
  const saveEdit = async () => {
    if (!editingWish) return;
    const text = editText.trim();
    if (!text) return Alert.alert("Empty", "Please enter a wish text.");

    try {
      const token = await getToken();
      if (!token) return;

      await axios.put(
        `${BASE}/editWish`,
        {
          wishlistItemId: editingWish._id,
          item: text,
          status: editStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // update local
      setWishes((prev) =>
        prev.map((w) =>
          w._id === editingWish._id ? { ...w, item: text, status: editStatus } : w
        )
      );

      setEditModalVisible(false);
      setEditingWish(null);
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error("Edit wish error:", msg);
      Alert.alert("Error", msg);
    }
  };

  // Delete wish
  const deleteWish = async (wishId: string) => {
    Alert.alert("Delete", "Remove this wish?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) return;

            // axios delete with body must use `data` option
            await axios.delete(`${BASE}/deleteWish`, {
              headers: { Authorization: `Bearer ${token}` },
              data: { wishlistItemId: wishId },
            });

            setWishes((prev) => prev.filter((w) => w._id !== wishId));
          } catch (err) {
            const msg = getErrorMessage(err);
            console.error("Delete wish error:", msg);
            Alert.alert("Error", msg);
          }
        },
      },
    ]);
  };

  // Render an item
  const renderItem = ({ item }: { item: Wish }) => {
    return (
      <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 mb-3 shadow">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={() => toggleStatus(item)}
            className="mr-3 p-2 rounded-full"
            accessibilityLabel="Toggle status"
          >
            {item.status === "completed" ? (
              <Ionicons name="checkmark-circle" size={28} color="#ec4899" />
            ) : (
              <Ionicons name="ellipse-outline" size={24} color="#ff9ecf" />
            )}
          </TouchableOpacity>

          <View className="flex-1">
            <Text
              className={`text-base ${item.status === "completed" ? "line-through text-gray-400" : "text-pink-700"} font-semibold`}
            >
              {item.item}
            </Text>
            <Text className="text-xs text-gray-400 mt-1">
              {new Date(item.createdAt || Date.now()).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center ml-3">
          <TouchableOpacity onPress={() => openEdit(item)} className="p-2 mr-2">
            <Ionicons name="pencil" size={20} color="#ff7ab6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteWish(item._id)} className="p-2">
            <Ionicons name="trash" size={20} color="#ff5b7a" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-pink-50 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-pink-700">💖 Couple Wishlist</Text>
        <TouchableOpacity
          onPress={fetchWishes}
          className="bg-pink-200 rounded-lg p-2"
          accessibilityLabel="Refresh"
        >
          <Ionicons name="refresh" size={20} color="#b8336a" />
        </TouchableOpacity>
      </View>

      {/* Add input */}
      <View className="bg-white rounded-2xl p-4 mb-4 shadow">
        <TextInput
          value={newWishText}
          onChangeText={setNewWishText}
          placeholder="Add a wish (e.g., Visit Delhi)"
          className="text-base text-gray-700 mb-3"
          placeholderTextColor="#b85b86"
        />
        <View className="flex-row justify-end">
          <TouchableOpacity
            onPress={addWish}
            className="bg-pink-500 px-4 py-2 rounded-full"
            accessibilityLabel="Add wish"
          >
            <Text className="text-white font-semibold">Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List or loader */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : wishes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-pink-400">No wishes yet — add something romantic ✨</Text>
        </View>
      ) : (
        <FlatList
          data={wishes}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 160 }}
        />
      )}

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-black/40 px-4">
          <View className="w-full bg-white rounded-2xl p-5">
            <Text className="text-lg font-semibold text-pink-700 mb-3">Edit Wish</Text>
            <TextInput
              value={editText}
              onChangeText={setEditText}
              placeholder="Wish"
              className="border border-pink-200 rounded-lg p-3 mb-3"
              placeholderTextColor="#b85b86"
            />
            <View className="flex-row items-center mb-4">
              <Text className="mr-3 text-sm text-gray-600">Status:</Text>
              <TouchableOpacity
                onPress={() => setEditStatus("pending")}
                className={`px-3 py-1 rounded-full mr-2 ${editStatus === "pending" ? "bg-pink-100" : "bg-gray-100"}`}
              >
                <Text className="text-sm">{Platform.OS === "ios" ? "Pending" : "Pending"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditStatus("completed")}
                className={`px-3 py-1 rounded-full ${editStatus === "completed" ? "bg-pink-100" : "bg-gray-100"}`}
              >
                <Text className="text-sm">Completed</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="px-4 py-2">
                <Text className="text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} className="bg-pink-500 px-4 py-2 rounded-full">
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
