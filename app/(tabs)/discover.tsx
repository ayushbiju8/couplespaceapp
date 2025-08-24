import React, { useState, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, FlatList, Image,
  ActivityIndicator, TextInput, Modal, ScrollView
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AddPostModal from '@/components/AddPostModal' // ✅ adjust path based on your folder structure


const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL

if (!BACKEND_URL) {
  console.error("❌ BACKEND_URL is not defined! Check your .env or app.config.")
}

const getValidToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem("token")
  if (!token || token.trim() === "" || token.trim() === "undefined") {
    await AsyncStorage.removeItem("token")
    return null
  }
  return token.trim()
}

type Comment = {
  _id: string
  user: {
    fullName: string
    profilePicture?: string
  }
  text: string
}

type Post = {
  id: string
  user: {
    fullName: string
    profilePicture?: string
  }
  content: string
  likes: number
  comments: number
  liked: boolean
  image?: string
}

const Discover: React.FC = () => {
  const [posting, setPosting] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [commentModal, setCommentModal] = useState<{ visible: boolean; postId?: string }>({ visible: false })
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | undefined>(undefined)

  const fetchPosts = async () => {
    const token = await getValidToken()
    if (!token) return

    try {
      const response = await fetch(`${BACKEND_URL}/post`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      const formattedPosts: Post[] = result.data.map((item: any) => ({
        id: item._id ?? '',
        user: {
          fullName: item.user?.fullName ?? 'Unknown',
          profilePicture: item.user?.profilePicture ?? undefined,
        },
        content: item.heading ?? '',
        likes: item.likes?.length ?? 0,
        comments: item.comments?.length ?? 0,
        liked: false,
        image: item.image ?? undefined,
      }))
      setPosts(formattedPosts)
    } catch (error) {
      console.error('❌ Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchPosts()
  }, [])

  

  const fetchComments = async (postId: string) => {
    const token = await getValidToken()
    if (!token) return

    setCommentsLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/post/${postId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const result = await response.json()
      const formatted = result?.data?.comments.map((c: any) => ({
        _id: c._id,
        user: {
          fullName: c.user?.fullName || 'Unknown',
          profilePicture: c.user?.profilePicture,
        },
        text: c.text,
      })) ?? []
      setComments(formatted)
    } catch (error) {
      console.error("❌ Failed to fetch comments:", error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleComment = (postId: string) => {
    setCommentModal({ visible: true, postId })
    fetchComments(postId)
  }

  const handleAddComment = async () => {
    if (!commentModal.postId || !newComment.trim()) return

    const token = await getValidToken()
    if (!token) return

    try {
      await fetch(`${BACKEND_URL}/post/${commentModal.postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      })
      setNewComment('')
      fetchComments(commentModal.postId)
    } catch (error) {
      console.error("❌ Error adding comment:", error)
    }
  }

  const handleLike = (id: string) => {
    setPosts(posts => posts.map(post => post.id === id
      ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
      : post))
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri)
    }
  }

  const handleAdd = async () => {
    if (!description.trim() && !image) {
      alert('Please enter a note or pick an image')
      return
    }
    const token = await getValidToken()
    if (!token) return

    const formData = new FormData()
    formData.append('heading', description)
    if (image) {
      formData.append('image', {
        uri: image,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as unknown as Blob)
    }
    try {
      await fetch(`${BACKEND_URL}/post/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      setDescription('')
      setImage(undefined)
      setModalVisible(false)
    } catch (error) {
      console.error('❌ Failed to add post:', error)
    }
  }

  const renderPost = ({ item }: { item: Post }) => (
    <View className="flex-row mx-3 my-2 p-3 bg-white rounded-xl shadow-md">
      {item.user.profilePicture ? (
        <Image source={{ uri: item.user.profilePicture }} className="w-9 h-9 rounded-full mr-3 mt-1" />
      ) : (
        <View className="w-9 h-9 rounded-full bg-pink-200 mr-3 mt-1" />
      )}
      <View className="flex-1">
        <Text className="font-bold text-pink-500 mb-1">{item.user.fullName}</Text>
        {item.image && (
          <Image source={{ uri: item.image }} className="w-full h-52 rounded-md mb-2" resizeMode="cover" />
        )}
        <Text className="text-base text-gray-800 mb-2">{item.content}</Text>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => handleLike(item.id)} className="flex-row items-center mr-4">
            <AntDesign name="heart" size={20} color={item.liked ? '#e75480' : '#aaa'} />
            <Text className="ml-1 text-gray-500">{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleComment(item.id)} className="flex-row items-center">
            <FontAwesome name="comment-o" size={20} color="#aaa" />
            <Text className="ml-1 text-gray-500">{item.comments}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  return (
    <View className="flex-1 bg-pink-100">
      <View className="pt-12 pb-4 items-center bg-pink-50 border-b border-pink-200">
        <Text className="text-xl font-bold text-pink-500">Discover</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e75480" className="mt-10" />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* Add Post Button */}
      <TouchableOpacity onPress={() => setModalVisible(true)} className="absolute bottom-3 right-6 bg-pink-500 w-14 h-14 rounded-full justify-center items-center shadow-lg">
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Add Post Modal */}
      <AddPostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        loading={posting}
        onAdd={async (selectedImage, enteredDescription) => {
          const token = await getValidToken()
          if (!token) return

          const formData = new FormData()
          formData.append('heading', enteredDescription)
          if (selectedImage) {
            formData.append('image', {
              uri: selectedImage,
              name: 'photo.jpg',
              type: 'image/jpeg',
            } as any)
          }

          try {
            setPosting(true)
            await fetch(`${BACKEND_URL}/post/create`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            })
            setModalVisible(false)
            setDescription('')
            setImage(undefined)
            // Optional: reload posts
            await fetchPosts()
          } catch (err) {
            console.error('❌ Failed to create post:', err)
          } finally {
            setPosting(false)
          }
        }}
      />


      {/* Comment Modal (same as before) */}
    </View>
  )
}

export default Discover