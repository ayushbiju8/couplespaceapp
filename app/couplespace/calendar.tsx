import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function CoupleCalendar() {
  const todayDate = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [modalVisible, setModalVisible] = useState(false);
  const [reminderType, setReminderType] = useState<
    "Birthday" | "Anniversary" | "Custom" | null
  >(null);
  const [customNote, setCustomNote] = useState("");
  const [events, setEvents] = useState<{
    [date: string]: { id: string; type: string; note?: string }[];
  }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationChannelAsync("reminders", {
      name: "Reminders",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.warn("No token found");
          return;
        }

        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/get-events`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const eventsData: {
          [date: string]: { id: string; type: string; note?: string }[];
        } = {};
        res.data.data.forEach((ev: any) => {
          const dateKey = ev.date.split("T")[0];
          if (!eventsData[dateKey]) eventsData[dateKey] = [];
          eventsData[dateKey].push({
            id: ev._id,
            type: ev.title || "Event",
            note: ev.description || "",
          });
        });

        setEvents(eventsData);
      } catch (err) {
        console.error("Error fetching events:", (err as Error).message);
      }
    };

    fetchEvents();
  }, []);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  };

  const handleGoToDate = (_event: any, date?: Date) => {
    if (date) {
      const d = date.toISOString().split("T")[0];
      setSelectedDate(d);
    }
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!reminderType) return;

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }

      const payload = {
        title: reminderType,
        description:
          reminderType === "Custom"
            ? customNote || ""
            : `Reminder: ${reminderType}`,
        date: new Date(selectedDate).toISOString(),
        startTime: "18:00",
        endTime: "22:00",
      };

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/add-event`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newEvent = {
        id: res.data.data._id, // store backend id
        type: reminderType,
        note: customNote,
      };

      setEvents((prev) => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), newEvent],
      }));

      const [year, month, day] = selectedDate.split("-").map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${reminderType} Reminder ❤️`,
          body:
            reminderType === "Custom"
              ? customNote || "Sweet reminder!"
              : `Don't forget: ${reminderType} on ${selectedDate}`,
          sound: true,
        },
        trigger: {
          channelId: "reminders",
          year,
          month,
          day,
          hour: 9,
          minute: 0,
          repeats: false,
        },
      });

      setModalVisible(false);
      setReminderType(null);
      setCustomNote("");
    } catch (err) {
      console.error("Error saving event:", (err as Error).message);
    }
  };

  const handleDelete = async (eventId: string, index: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.warn("No token found");
        return;
      }

      await axios.delete(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/delete-event`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { eventId },
        }
      );

      const updated = [...(events[selectedDate] || [])];
      updated.splice(index, 1);
      setEvents({ ...events, [selectedDate]: updated });
    } catch (err) {
      console.error("Error deleting event:", (err as Error).message);
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};

    // Add pink dots for event days
    Object.keys(events).forEach((date) => {
      marked[date] = { marked: true, dotColor: "pink" };
    });

    // Highlight selected day
    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: "#FFB6C1",
    };

    return marked;
  };

  const renderEvents = () => {
    const dateEvents = events[selectedDate] || [];
    if (!dateEvents.length)
      return <Text className="text-gray-500 italic text-center">No Events</Text>;

    return dateEvents.map((ev, idx) => (
      <View
        key={ev.id}
        className="flex-row justify-between bg-pink-100 p-2 rounded-lg mb-2"
      >
        <Text className="text-pink-900 text-sm">
          {ev.type}: {ev.note}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(ev.id, idx)}>
          <Ionicons name="trash-outline" size={20} color="#ff69b4" />
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View className="flex-1 bg-pink-100 pt-10 px-4">
      <View className="items-center mb-3">
        <Text className="text-lg font-bold text-pink-500">Calendar</Text>
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: "#fff0f5",
          calendarBackground: "#fff0f5",
          textSectionTitleColor: "#b03060",
          selectedDayBackgroundColor: "#ff69b4",
          todayTextColor: "#ff69b4",
          dayTextColor: "#333",
          arrowColor: "#ff69b4",
          monthTextColor: "#b03060",
          dotColor: "pink",
        }}
      />

      <View className="flex-row justify-between my-2">
        <TouchableOpacity
          className="border border-pink-400 rounded-lg px-3 py-2"
          onPress={handleToday}
        >
          <Text className="text-pink-500">Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border border-pink-400 rounded-lg px-3 py-2"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-pink-500">Go to Date</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-pink-50 rounded-xl p-3 mt-2 relative">
        <Text className="text-lg font-bold text-pink-900 mb-1">
          {new Date(selectedDate).toDateString()}
        </Text>
        <ScrollView>{renderEvents()}</ScrollView>
        <TouchableOpacity
          className="absolute bottom-2 right-2 bg-pink-500 rounded-full p-3 shadow"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleGoToDate}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-center items-center">
          <View className="w-[90%] bg-white rounded-2xl p-5 items-center">
            <Text className="text-lg font-semibold mb-3 text-pink-900">
              Add Reminder for {selectedDate}
            </Text>
            <ScrollView className="w-full">
              {["Birthday", "Anniversary", "Custom"].map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`py-3 px-4 rounded-lg mb-2 ${
                    reminderType === type ? "bg-pink-200" : "bg-gray-100"
                  }`}
                  onPress={() => setReminderType(type as any)}
                >
                  <Text className="text-base text-gray-700">{type}</Text>
                </TouchableOpacity>
              ))}
              {reminderType === "Custom" && (
                <TextInput
                  placeholder="Add a sweet note or reminder ❤️"
                  className="w-full min-h-[60px] border border-gray-300 rounded-lg p-2 mt-2 bg-white text-base"
                  multiline
                  value={customNote}
                  onChangeText={setCustomNote}
                />
              )}
            </ScrollView>
            <View className="flex-row justify-between w-full mt-4">
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text className="text-pink-500 font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
