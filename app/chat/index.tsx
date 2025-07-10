import { useUser } from "@/contexts/UserContext";
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
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { currentUser } = useUser();

  useEffect(() => {
    if (!currentUser?._id) return;

    const setup = async () => {
      const token = await AsyncStorage.getItem("token");
      setUserId(currentUser._id);

      await connectSocket();
      const socket = getSocket();

      socket?.on("connect", () => {
        console.log("Socket connected");
      });

      socket?.on("sendBack", (data: Message) => {
        setMessages((prev) => [...prev, data]);
      });

      try {
        const res = await axios.get("http://10.167.184.153:8000/api/v1/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(res.data.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    setup();

    return () => {
      getSocket()?.disconnect();
    };
  }, [currentUser]);

  const handleSend = () => {
    const socket = getSocket();
    if (!message.trim()) return;

    socket?.emit("send", { text: message });
    setMessage("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSentByMe = item.senderId === userId;

    return (
      <View
        className={`max-w-[80%] px-4 py-2 m-2 rounded-2xl ${
          isSentByMe
            ? "bg-pink-500 self-end rounded-br-none"
            : "bg-gray-200 self-start rounded-bl-none"
        }`}
      >
        <Text className={`text-base ${isSentByMe ? "text-white" : "text-black"}`}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-row items-center px-3 py-2 border-t border-gray-300 bg-white"
      >
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-base mr-2"
        />
        <TouchableOpacity onPress={handleSend} className="bg-pink-500 p-3 rounded-full">
          <Text className="text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
