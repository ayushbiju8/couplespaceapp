import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Memory = {
  image: string;
  heading?: string;
  description?: string;
  date?: string;
};

const Roadmap = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const chunkArray = (array: Memory[], size = 3): Memory[][] => {
    const chunks: Memory[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const getMemories = async () => {
    setLoading(true);
    try {
      const cached = await AsyncStorage.getItem('roadmap_cache');
      if (cached) {
        const parsed: Memory[] = JSON.parse(cached);
        setMemories(parsed);
      }
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/getroadmap`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: Memory[] = res.data.data;
      setMemories(data);
      await AsyncStorage.setItem('roadmap_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMemories();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const addMemory = async () => {
    if (!heading || !description || !image) {
      alert('All fields required');
      return;
    }

    const newMemory: Memory = {
      image,
      heading,
      description,
      date: new Date().toISOString(),
    };

    const updated = [newMemory, ...memories];
    setMemories(updated);
    await AsyncStorage.setItem('roadmap_cache', JSON.stringify(updated));
    setHeading('');
    setDescription('');
    setImage(null);
    setAddModal(false);
  };

  const filteredMemories = filter
    ? memories.filter((m) => m.heading?.toLowerCase().includes(filter.toLowerCase()))
    : memories;

  const renderCircle = (memory: Memory, index: number) => (
    <TouchableOpacity
      key={index}
      className="w-24 h-24 rounded-full bg-pink-300 overflow-hidden mx-1 my-2"
      onPress={() => {
        setActiveMemory(memory);
        setModalVisible(true);
      }}
    >
      <Image source={{ uri: memory.image }} className="w-full h-full rounded-full" resizeMode="cover" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-pink-100 pt-12">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-2">Memory Roadmap</Text>

      <TextInput
        placeholder="Search memories..."
        value={filter}
        onChangeText={setFilter}
        className="bg-white mx-4 p-2 rounded-md mb-3"
      />

      {loading ? (
        <ActivityIndicator size="large" color="pink" className="mt-10" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {chunkArray(filteredMemories, 3).map((group, i) => (
            <View key={i} className="flex-row justify-center">
              {group.map((memory, j) => renderCircle(memory, j))}
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => setAddModal(true)}
        className="absolute bottom-6 right-6 bg-pink-500 w-14 h-14 rounded-full items-center justify-center"
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>

      {/* View Memory Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <MotiView
            from={{ opacity: 0, translateY: 300 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            className="bg-white rounded-xl p-4 w-11/12"
          >
            <Image source={{ uri: activeMemory?.image }} className="w-full h-48 rounded-lg mb-4" resizeMode="cover" />
            <Text className="text-xl font-bold text-center text-gray-800 mb-2">{activeMemory?.heading || 'Untitled'}</Text>
            <Text className="text-base text-center text-gray-600">{activeMemory?.description || 'No description'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-6 bg-pink-500 py-2 rounded-md">
              <Text className="text-white text-center font-semibold">Close</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>

      {/* Add Memory Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-40">
          <View className="bg-white w-11/12 rounded-xl p-4">
            <Text className="text-lg font-semibold text-center mb-2">Add a Memory</Text>
            <TextInput
              value={heading}
              onChangeText={setHeading}
              placeholder="Heading"
              className="border border-gray-300 p-2 rounded mb-2"
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              multiline
              className="border border-gray-300 p-2 rounded mb-2 h-20"
            />
            <TouchableOpacity onPress={pickImage} className="bg-gray-200 p-2 rounded mb-2">
              <Text className="text-center text-gray-700">Choose Image</Text>
            </TouchableOpacity>
            {image && (
              <Image source={{ uri: image }} className="w-full h-40 rounded mb-2" resizeMode="cover" />
            )}
            <TouchableOpacity onPress={addMemory} className="bg-pink-500 py-2 rounded">
              <Text className="text-center text-white font-bold">Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddModal(false)}>
              <Text className="text-center text-sm text-gray-600 mt-2">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Roadmap;