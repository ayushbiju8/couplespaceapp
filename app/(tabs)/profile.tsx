// 🧠 Unchanged imports...
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// 😎 Still the same type
type Post = {
  id: string;
  uri: string;
};

const Profile = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Alex');
  const [dob, setDob] = useState('14 Feb 2020');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempDob, setTempDob] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [tempInterests, setTempInterests] = useState('');
  const [profilePicUri, setProfilePicUri] = useState('');
  const [loading, setLoading] = useState(true);
  const [profilePicModalVisible, setProfilePicModalVisible] = useState(false);
  const profilePicScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/current-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = res.data.data;
      setName(userData.fullName);
      setDob(new Date(userData.dob).toDateString());
      setBio(userData.bio);
      setInterests(JSON.parse(userData.interests[0] || '[]').join(', '));
      setProfilePicUri(userData.profilePicture?.startsWith('http') ? userData.profilePicture : '');

    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Could not load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openProfilePic = () => {
    setProfilePicModalVisible(true);
    Animated.spring(profilePicScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const closeProfilePic = () => {
    Animated.timing(profilePicScale, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setProfilePicModalVisible(false));
  };

  const handleEdit = () => {
    setTempName(name);
    setTempDob(dob);
    setTempBio(bio);
    setTempInterests(interests);
    setIsEditing(true);
  };

  const handleSave = () => {
    try {
      setName(tempName);
      setDob(tempDob);
      setBio(tempBio);
      setInterests(tempInterests);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
      Alert.alert('Error', 'Something went wrong while saving.');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Allow access to your gallery to change profile pic');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const selectedImage = result.assets[0].uri;
      setProfilePicUri(selectedImage);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View className="w-1/3 aspect-square m-1 rounded-lg bg-white overflow-hidden shadow">
      <Image source={{ uri: item.uri }} className="w-full h-full" />
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#D81B60" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-pink-50">
      <View className="pt-10 px-5 items-end">
        <TouchableOpacity onPress={() => router.push('/otherpages/settings')}>
          <Ionicons name="settings-outline" size={24} color="#D81B60" />
        </TouchableOpacity>
      </View>

      {/* Modal for Profile Pic */}
      <Modal
        visible={profilePicModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeProfilePic}
      >
        <TouchableOpacity className="flex-1 bg-black/85 justify-center items-center" onPress={closeProfilePic}>
          <Animated.Image
            source={
              profilePicUri
                ? { uri: profilePicUri }
                : require('../../assets/images/e.jpg') // 👈 fallback image
            }
            style={{ width: 300, height: 300, borderRadius: 150, transform: [{ scale: profilePicScale }] }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      {/* Profile Section */}
      <View className="px-5 mt-5">
        <View className="bg-white rounded-xl p-4 shadow-md">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => (isEditing ? pickImage() : openProfilePic())}>
              <Image
                source={
                  profilePicUri
                    ? { uri: profilePicUri }
                    : require('../../assets/images/e.jpg')
                }
                className="w-24 h-24 rounded-full border-2 border-pink-600 shadow"
              />
            </TouchableOpacity>

            <View className="flex-1">
              {isEditing ? (
                <>
                  <TextInput
                    className="text-base text-gray-700 mt-1 border-b border-gray-300"
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Name"
                  />
                  <TextInput
                    className="text-base text-gray-700 mt-1 border-b border-gray-300"
                    value={tempBio}
                    onChangeText={setTempBio}
                    placeholder="Bio"
                  />
                  <TextInput
                    className="text-base text-gray-700 mt-1 border-b border-gray-300"
                    value={tempDob}
                    onChangeText={setTempDob}
                    placeholder="Date of Birth"
                  />
                  <TextInput
                    className="text-base text-gray-700 mt-1 border-b border-gray-300"
                    value={tempInterests}
                    onChangeText={setTempInterests}
                    placeholder="Interests"
                  />
                </>
              ) : (
                <>
                  <Text className="text-xl font-bold text-pink-700">{name}</Text>
                  <Text className="text-base italic text-gray-600 mt-1">{bio}</Text>
                  <Text className="text-sm text-gray-500 mt-1">DOB: {dob}</Text>
                  <Text className="text-sm text-gray-500">Interests: {interests}</Text>
                </>
              )}
              <Text className="text-sm text-gray-500 mt-1">Posts: {posts.length}</Text>
            </View>
          </View>

          {isEditing ? (
            <TouchableOpacity onPress={handleSave} className="bg-green-600 rounded-lg py-2 mt-4 items-center">
              <Text className="text-white font-semibold">Done</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleEdit} className="self-end mt-3">
              <Text className="text-pink-700 font-medium">Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Divider */}
      <View className="flex-row items-center mt-6 mb-2 mx-5">
        <View className="flex-1 h-px bg-pink-200" />
        <Text className="mx-2 text-sm text-pink-600 font-semibold">About Me</Text>
        <View className="flex-1 h-px bg-pink-200" />
      </View>

      {/* Posts Heading */}
      <Text className="text-xl font-bold text-pink-600 px-5 mt-2 mb-2">📸 Posts</Text>

      {/* Posts Grid */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 40 }}
      />
    </ScrollView>
  );
};

export default Profile;