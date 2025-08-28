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
  heading?: string;
  content?: string;
};

type PostDetails = {
  _id: string;
  user: { _id: string };
  heading: string;
  content: string | null;
  image: string | null;
  likes: any[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
};

const Profile = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
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

  // 🔎 New state for in-page post details modal
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostDetails | null>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/fetch-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = res.data.user || res.data.data || res.data;
      if (!userData) throw new Error('User data not found in response');

      const rawDob = userData.dob ? new Date(userData.dob) : null;

      setName(userData.fullName || '');
      setDob(rawDob ? rawDob.toDateString() : '');
      setTempDob(rawDob ? rawDob.toISOString().split('T')[0] : '');
      setBio(userData.bio || '');
      setInterests(userData.interests?.length ? JSON.parse(userData.interests[0] || '[]').join(', ') : '');
      setTempInterests(userData.interests?.length ? JSON.parse(userData.interests[0] || '[]').join(', ') : '');
      setProfilePicUri(userData.profilePicture || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Could not load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/post/mypost`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const postsData = res.data?.data;
      if (!Array.isArray(postsData)) {
        throw new Error('Posts data not found in response');
      }

      const formattedPosts: Post[] = postsData.map((p: any) => ({
        id: p?._id || Math.random().toString(),
        uri: p?.image || '',
        heading: p?.heading || '',
        content: p?.content || '',
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('❌ Failed to fetch posts:', error);
      Alert.alert('Error', 'Could not load your posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔎 Fetch single post details and open modal
  const openPostDetails = async (postId: string) => {
    try {
      setDetailsLoading(true);
      setDetailsVisible(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/post/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data: PostDetails | undefined = res.data?.data;
      if (!data) throw new Error('Post details not found');

      setSelectedPost(data);
    } catch (err) {
      console.error('❌ Failed to fetch post details:', err);
      Alert.alert('Error', 'Could not load post details.');
      setDetailsVisible(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const deletePost = (postId: string) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (!token) throw new Error('No token found');

            await axios.delete(
              `${process.env.EXPO_PUBLIC_BACKEND_URL}/post/${postId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh list and close modal
            await fetchMyPosts();
            setDetailsVisible(false);
            setSelectedPost(null);
            Alert.alert('Deleted', 'Your post has been deleted.');
          } catch (err) {
            console.error('❌ Failed to delete post:', err);
            Alert.alert('Error', 'Failed to delete post.');
          }
        },
      },
    ]);
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
    setTempBio(bio);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const formData = new FormData();
      formData.append('fullName', tempName);
      formData.append('dob', tempDob);
      formData.append('bio', tempBio);
      formData.append('interests', JSON.stringify(tempInterests.split(',').map((s) => s.trim())));

      if (profilePicUri?.startsWith('file://')) {
        formData.append('profilePicture', {
          uri: profilePicUri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }

      await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/edit-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      await fetchProfileData();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      Alert.alert('Error', 'Something went wrong while updating.');
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

  useEffect(() => {
    fetchProfileData();
    fetchMyPosts();
  }, []);

  // Split posts for layout
  const imagePosts = posts.filter((p) => p.uri);
  const textPosts = posts.filter((p) => !p.uri);

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

      {/* Profile Pic Modal */}
      <Modal
        visible={profilePicModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeProfilePic}
      >
        <TouchableOpacity className="flex-1 bg-black/85 justify-center items-center" onPress={closeProfilePic}>
          <Animated.Image
            source={profilePicUri ? { uri: profilePicUri } : require('../../assets/images/e.jpg')}
            style={{ width: 300, height: 300, borderRadius: 150, transform: [{ scale: profilePicScale }] }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      {/* Profile Card */}
      <View className="px-5 mt-5">
        <View className="bg-white rounded-xl p-4 shadow-md">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => (isEditing ? pickImage() : openProfilePic())}>
              <Image
                source={profilePicUri ? { uri: profilePicUri } : require('../../assets/images/e.jpg')}
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
                    placeholder="Date of Birth (yyyy-mm-dd)"
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

      {/* About Me */}
      <View className="flex-row items-center mt-6 mb-2 mx-5">
        <View className="flex-1 h-px bg-pink-200" />
        <Text className="mx-2 text-sm text-pink-600 font-semibold">About Me</Text>
        <View className="flex-1 h-px bg-pink-200" />
      </View>

      {/* Posts Section */}
      <Text className="text-xl font-bold text-pink-600 px-5 mt-2 mb-2">📸 Posts</Text>

      {/* Image posts grid */}
      <FlatList
        data={imagePosts}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openPostDetails(item.id)}
            className="w-1/3 aspect-square m-1 rounded-lg bg-white overflow-hidden shadow"
          >
            <Image source={{ uri: item.uri }} className="w-full h-full" />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        ListEmptyComponent={<Text className="text-gray-500 text-center my-3">No image posts yet</Text>}
      />

      {/* Text-only posts */}
      {textPosts.length > 0 && (
        <View className="px-5 mt-6">
          <Text className="text-lg font-semibold text-pink-700 mb-2">📝 Text Posts</Text>
          {textPosts.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => openPostDetails(item.id)}
              className="p-3 mb-3 rounded-lg bg-white shadow border border-pink-100"
            >
              <Text className="font-bold text-gray-800">{item.heading || 'Untitled'}</Text>
              {item.content ? (
                <Text className="text-gray-600 mt-1" numberOfLines={2}>
                  {item.content}
                </Text>
              ) : (
                <Text className="text-gray-400 mt-1">No content</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 🔎 Post Details Modal (in this page) */}
      <Modal
        visible={detailsVisible}
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View className="flex-1 bg-pink-50">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 bg-white shadow">
            <Text className="text-lg font-semibold text-pink-700">Post Details</Text>
            <TouchableOpacity onPress={() => setDetailsVisible(false)}>
              <Ionicons name="close" size={24} color="#D81B60" />
            </TouchableOpacity>
          </View>

          {detailsLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#D81B60" />
            </View>
          ) : selectedPost ? (
            <ScrollView className="flex-1 px-4 py-4">
              {selectedPost.image ? (
                <Image
                  source={{ uri: selectedPost.image }}
                  className="w-full h-64 rounded-xl mb-4"
                  resizeMode="cover"
                />
              ) : null}

              <Text className="text-2xl font-bold text-gray-800">{selectedPost.heading || 'Untitled'}</Text>

              {selectedPost.content ? (
                <Text className="text-base text-gray-700 mt-2">{selectedPost.content}</Text>
              ) : (
                <Text className="text-base text-gray-400 mt-2">No content</Text>
              )}

              <Text className="text-xs text-gray-500 mt-3">
                Posted on {new Date(selectedPost.createdAt).toLocaleString()}
              </Text>

              <View className="flex-row items-center gap-4 mt-3">
                <Text className="text-sm text-gray-600">❤️ {selectedPost.likes?.length || 0}</Text>
                <Text className="text-sm text-gray-600">💬 {selectedPost.comments?.length || 0}</Text>
              </View>

              {/* Delete button */}
              <TouchableOpacity
                onPress={() => deletePost(selectedPost._id)}
                className="bg-red-600 rounded-lg py-3 mt-6 items-center"
              >
                <Text className="text-white font-semibold">Delete Post</Text>
              </TouchableOpacity>

              {/* Close button */}
              <TouchableOpacity
                onPress={() => setDetailsVisible(false)}
                className="bg-gray-800 rounded-lg py-3 mt-3 items-center"
              >
                <Text className="text-white">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-600">No post selected</Text>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Profile;
