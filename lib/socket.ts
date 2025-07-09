import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

export const connectSocket = async () => {
  const token = await AsyncStorage.getItem("token");

  socket = io("http://10.167.184.153:8000", {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  return socket;
};

export const getSocket = () => socket;
