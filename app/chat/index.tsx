import { useUser } from "@/contexts/UserContext";
import { connectSocket, getSocket } from "@/lib/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

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
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === data._id);
          return exists ? prev : [...prev, data];
        });
      });

      try {
        try {
          const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/chat`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setMessages([...res.data.data].reverse()); // Reverse to show oldest first
        } catch (err) {
          console.error("Fetch error:", err);
        }

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

    socket?.emit("send", {
      text: message.trim(),
    });

    setMessage("");
  };


  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isSentByMe = item.senderId === userId;
    const previousMsg = messages[index - 1];
    const nextMsg = messages[index + 1];

    const currentDate = dayjs(item.createdAt);
    const prevDate = previousMsg ? dayjs(previousMsg.createdAt) : null;

    const showDateHeader =
      index === 0 || !prevDate?.isSame(currentDate, "day");

    const nextIsSameSender = nextMsg?.senderId === item.senderId;
    const showTimestamp = !nextIsSameSender;

    const formattedDate = currentDate.isToday()
      ? "Today"
      : currentDate.isYesterday()
        ? "Yesterday"
        : currentDate.format("MMMM D, YYYY");

    return (
      <>
        {showDateHeader && (
          <View className="items-center my-2">
            <View className="bg-white/60 px-4 py-1 rounded-full">
              <Text className="text-xs text-gray-600">{formattedDate}</Text>
            </View>
          </View>
        )}

        <View
          className={`max-w-[80%] px-4 py-3 m-2 rounded-3xl ${isSentByMe
              ? "bg-[#fbb6ce] self-end rounded-br-none"
              : "bg-white/90 self-start rounded-bl-none"
            }`}
          style={{
            marginLeft: isSentByMe ? 50 : 10,
            marginRight: isSentByMe ? 10 : 50,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <Text className={`text-base ${isSentByMe ? "text-black" : "text-black"}`}>
            {item.text}
          </Text>
          {showTimestamp && (
            <Text className="text-[10px] text-gray-500 mt-1 self-end">
              {dayjs(item.createdAt).format("h:mm A")}
            </Text>
          )}
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ImageBackground
        source={require("../../assets/images/background.jpg")}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1 bg-black/10">
          <SafeAreaView className="flex-1">
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={renderMessage}
              contentContainerStyle={{ padding: 10, paddingTop: 60 }}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              keyboardShouldPersistTaps="handled"
            />

            <View className="px-3 py-3">
              <BlurView
                intensity={70}
                tint="light"
                className="flex-row items-center rounded-full px-3 py-2 bg-white/30 backdrop-blur-md"
              >
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type something..."
                  placeholderTextColor="#444"
                  className="flex-1 px-4 py-2 text-base text-black"
                />
                <TouchableOpacity
                  onPress={handleSend}
                  className="bg-pink-500 px-4 py-2 rounded-full ml-2"
                >
                  <Text className="text-white font-bold">Send</Text>
                </TouchableOpacity>
              </BlurView>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}