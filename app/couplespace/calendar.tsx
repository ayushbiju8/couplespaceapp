import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CoupleCalendar() {
  const todayDate = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [modalVisible, setModalVisible] = useState(false);
  const [reminderType, setReminderType] = useState<'Birthday' | 'Anniversary' | 'Custom' | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [events, setEvents] = useState<{ [date: string]: { type: string; note?: string }[] }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
    Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }, []);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const handleGoToDate = (event: any, date?: Date) => {
    if (date) {
      const d = date.toISOString().split('T')[0];
      setSelectedDate(d);
    }
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!reminderType) return;

    const updatedEvents = { ...events };
    const newEvent = { type: reminderType, note: customNote };
    updatedEvents[selectedDate] = [...(updatedEvents[selectedDate] || []), newEvent];
    setEvents(updatedEvents);

    const [year, month, day] = selectedDate.split('-').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${reminderType} Reminder ❤️`,
        body: reminderType === 'Custom' ? customNote || 'Sweet reminder!' : `Don't forget: ${reminderType} on ${selectedDate}`,
        sound: true,
      },
      trigger: {
        channelId: 'reminders',
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
    setCustomNote('');
  };

  const handleDelete = (index: number) => {
    const updated = [...(events[selectedDate] || [])];
    updated.splice(index, 1);
    setEvents({ ...events, [selectedDate]: updated });
  };

  const renderEvents = () => {
    const dateEvents = events[selectedDate] || [];
    if (!dateEvents.length) return <Text style={styles.noEvent}>No Events</Text>;

    return dateEvents.map((ev, idx) => (
      <View key={idx} style={styles.eventBox}>
        <Text style={styles.eventText}>{ev.type}: {ev.note}</Text>
        <TouchableOpacity onPress={() => handleDelete(idx)}>
          <Ionicons name="trash-outline" size={20} color="#ff69b4" />
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>        
        <Text style={styles.coupleText}>Calendar</Text>
      </View>

      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            marked: true,
            selectedColor: '#FFB6C1',
          },
        }}
        theme={{
          backgroundColor: '#fff0f5',
          calendarBackground: '#fff0f5',
          textSectionTitleColor: '#b03060',
          selectedDayBackgroundColor: '#ff69b4',
          todayTextColor: '#ff69b4',
          dayTextColor: '#333',
          arrowColor: '#ff69b4',
          monthTextColor: '#b03060',
        }}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleToday}>
          <Text style={styles.actionText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.actionText}>Go to Date</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.eventContainer}>
        <Text style={styles.dateTitle}>{new Date(selectedDate).toDateString()}</Text>
        <ScrollView>{renderEvents()}</ScrollView>
        <TouchableOpacity
          style={styles.fab}
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
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Reminder for {selectedDate}</Text>
            <ScrollView style={{ width: '100%' }}>
              {['Birthday', 'Anniversary', 'Custom'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.reminderOption, reminderType === type && { backgroundColor: '#ffc0cb' }]}
                  onPress={() => setReminderType(type as any)}
                >
                  <Text style={styles.reminderText}>{type}</Text>
                </TouchableOpacity>
              ))}
              {reminderType === 'Custom' && (
                <TextInput
                  placeholder="Add a sweet note or reminder ❤️"
                  style={styles.input}
                  multiline
                  value={customNote}
                  onChangeText={setCustomNote}
                />
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#888' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave}>
                <Text style={{ color: '#ff69b4', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffe6f0',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  coupleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
  subHeader: {
    fontSize: 13,
    color: '#b03060',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#ff69b4',
    borderRadius: 8,
    padding: 8,
  },
  actionText: {
    color: '#ff69b4',
  },
  eventContainer: {
    flex: 1,
    backgroundColor: '#fff0f5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    position: 'relative',
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b03060',
    marginBottom: 6,
  },
  noEvent: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  eventBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffe6ec',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  eventText: {
    color: '#b03060',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#ff69b4',
    borderRadius: 24,
    padding: 12,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#b03060',
  },
  reminderOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  reminderText: {
    fontSize: 16,
    color: '#444',
  },
  input: {
    width: '100%',
    minHeight: 60,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    textAlignVertical: 'top',
    backgroundColor: '#fdfdfd',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
});