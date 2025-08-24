import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { MotiView } from 'moti';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CURVE_COLOR = '#b3005e';
const CIRCLE_SIZE = 96;
const SPACING = 100;
const CONTROL_OFFSET = 120;

interface Memory {
  _id: string;
  heading: string;
  description: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

const Roadmap = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getMemories();
  }, []);

  /** Fetch roadmap data */
  const getMemories = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem('roadmap_cache');
      if (cached) setMemories(JSON.parse(cached));

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        setLoading(false);
        return;
      }

      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/getroadmap`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMemories(res.data.data || []);
      await AsyncStorage.setItem('roadmap_cache', JSON.stringify(res.data.data || []));
    } catch (err: any) {
      console.error('GET error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Pick image with permission handling */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission denied', 'Media library permission is required.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  /** Add a new memory */
  const addMemory = async () => {
    if (!heading || !description || !image) {
      return Alert.alert('Please fill all fields.');
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Not logged in');

      const formData = new FormData();
      formData.append('heading', heading);
      formData.append('description', description);
      formData.append('image', {
        uri: image,
        name: 'roadmap.jpg',
        type: 'image/jpeg',
      } as unknown as Blob);

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/couples/addroadmap`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('✅ Upload success:', res.data);
      await getMemories();
      setAddModal(false);
      setHeading('');
      setDescription('');
      setImage(null);
    } catch (err: any) {
      console.error('❌ POST error:', err.response?.data || err.message);
      Alert.alert('Upload failed', err.response?.data?.message || 'Try again');
    }
  };

  const filteredMemories = filter
    ? memories.filter((m) => m.heading?.toLowerCase().includes(filter.toLowerCase()))
    : memories;

  const containerHeight = filteredMemories.length * (CIRCLE_SIZE + SPACING);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffe4ec', paddingTop: 48 }}>
      {/* Header */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: CURVE_COLOR, marginBottom: 10 }}>
        💖 Memory Roadmap
      </Text>

      {/* Search */}
      <TextInput
        placeholder="Search memories..."
        value={filter}
        onChangeText={setFilter}
        style={{
          backgroundColor: '#fff0f5',
          marginHorizontal: 16,
          padding: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#ff9ecf',
          marginBottom: 10,
          color: CURVE_COLOR,
        }}
        placeholderTextColor={CURVE_COLOR}
      />

      {/* Loader or Content */}
      {loading ? (
        <ActivityIndicator size="large" color="#d11c84" style={{ marginTop: 30 }} />
      ) : (
        <Animated.ScrollView
          contentContainerStyle={{ height: containerHeight, paddingBottom: 150 }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
        >
          {/* Curved lines */}
          <Animated.View style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
            <Svg width={screenWidth} height={containerHeight}>
              {filteredMemories.slice(0, -1).map((memory, index) => {
                const y1 = index * (CIRCLE_SIZE + SPACING) + CIRCLE_SIZE;
                const y2 = (index + 1) * (CIRCLE_SIZE + SPACING);
                const x1 = screenWidth / 2 + (index % 2 === 0 ? -50 : 50);
                const x2 = screenWidth / 2 + ((index + 1) % 2 === 0 ? -45 : 50);
                const cx = (x1 + x2) / 2;
                const cy = y1 + CONTROL_OFFSET;

                const d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
                const inputRange = [y1 - screenHeight / 2, y2];
                const opacity = scrollY.interpolate({
                  inputRange,
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                });

                return (
                  <AnimatedPath
                    key={`line-${memory._id}`}
                    d={d}
                    stroke={CURVE_COLOR}
                    fill="none"
                    strokeWidth={4}
                    strokeLinecap="round"
                    opacity={opacity}
                  />
                );
              })}
            </Svg>
          </Animated.View>

          {/* Memory circles */}
          {filteredMemories.map((memory, index) => {
            const y = index * (CIRCLE_SIZE + SPACING);
            const centerOffset = screenHeight / 2 - CIRCLE_SIZE / 2;
            const x = screenWidth / 2 - CIRCLE_SIZE / 2 + (index % 2 === 0 ? -60 : 60);

            const scale = scrollY.interpolate({
              inputRange: [y - centerOffset - 100, y - centerOffset, y - centerOffset + 100],
              outputRange: [1, 1.3, 1],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={memory._id}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: [{ scale }],
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  borderRadius: 100,
                  overflow: 'hidden',
                  backgroundColor: '#ffb6c1',
                  shadowColor: '#ff69b4',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4,
                  zIndex: 1,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setActiveMemory(memory);
                    setModalVisible(true);
                  }}
                >
                  <Image source={{ uri: memory.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setAddModal(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          backgroundColor: '#ff69b4',
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#d11c84',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: 'white', fontSize: 32 }}>+</Text>
      </TouchableOpacity>

      {/* View Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000080' }}>
          <MotiView
            from={{ opacity: 0, translateY: 300 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={{
              backgroundColor: '#fff0f5',
              borderRadius: 20,
              padding: 20,
              width: '90%',
            }}
          >
            <Image source={{ uri: activeMemory?.image }} style={{ width: '100%', height: 180, borderRadius: 12 }} resizeMode="cover" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: CURVE_COLOR, marginVertical: 10 }}>
              {activeMemory?.heading}
            </Text>
            <Text style={{ textAlign: 'center', color: '#5e2a4d' }}>{activeMemory?.description}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 16, backgroundColor: '#d11c84', padding: 10, borderRadius: 8 }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Close</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>

      {/* Add Memory Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066' }}>
          <View style={{ backgroundColor: '#fff0f5', width: '90%', borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: CURVE_COLOR, marginBottom: 10 }}>
              Add a Memory
            </Text>
            <TextInput
              value={heading}
              onChangeText={setHeading}
              placeholder="Heading"
              style={{ borderWidth: 1, borderColor: '#ff9ecf', padding: 10, borderRadius: 8, marginBottom: 10 }}
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              multiline
              style={{ borderWidth: 1, borderColor: '#ff9ecf', padding: 10, borderRadius: 8, marginBottom: 10, height: 80 }}
            />
            <TouchableOpacity onPress={pickImage} style={{ backgroundColor: '#ffe4ec', padding: 10, borderRadius: 8, marginBottom: 10 }}>
              <Text style={{ textAlign: 'center', color: CURVE_COLOR }}>Choose Image</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={{ width: '100%', height: 160, borderRadius: 10, marginBottom: 10 }} />}
            <TouchableOpacity onPress={addMemory} style={{ backgroundColor: '#ff69b4', padding: 12, borderRadius: 8 }}>
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddModal(false)}>
              <Text style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Roadmap;
