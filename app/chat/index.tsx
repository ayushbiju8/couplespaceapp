import { connectSocket, getSocket } from "@/lib/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Message = {
  _id: string;
  text?: string;
  image?: string;
  senderId: string;
  createdAt: string;
};

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get("http://10.167.184.153:8000/api/v1/chat", {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
      });
      setMessages(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    const setupSocket = async () => {
      await connectSocket();
      const socket = getSocket();

      socket?.on("connect", () => {
        console.log("Socket connected");
      });

      socket?.on("sendBack", (data: Message) => {
        setMessages((prev) => [...prev, data]);
      });
    };

    fetchMessages();
    setupSocket();

    return () => {
      getSocket()?.disconnect();
    };
  }, []);

  const handleSend = () => {
    const socket = getSocket();
    if (!message.trim()) return;

    socket?.emit("send", { text: message });
    setMessage("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className={`p-2 my-1 mx-3 rounded-lg ${item.senderId === "YOUR_ID" ? "bg-pink-200 self-end" : "bg-gray-200 self-start"}`}>
            {item.text && <Text className="text-sm">{item.text}</Text>}
          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-row items-center px-3 py-2 border-t border-gray-200">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
        />
        <TouchableOpacity onPress={handleSend} className="bg-pink-500 p-2 rounded-full">
          <Text className="text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
