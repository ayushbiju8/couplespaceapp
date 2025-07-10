import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import {
    Image,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

type Props = {
  visible: boolean
  onClose: () => void
  onAdd: (image: string | undefined, description: string) => void
}

const AddPostModal: React.FC<Props> = ({ visible, onClose, onAdd }) => {
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | undefined>(undefined)

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        alert('Permission to access media library is required!')
      }
    })()
  }, [])

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

  const handleAdd = () => {
    if (!description.trim() && !image) {
      alert('Please enter a note or pick an image')
      return
    }

    onAdd(image, description)
    setDescription('')
    setImage(undefined)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-center items-center px-4">
        <View className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
          <Text className="text-2xl font-bold text-center text-pink-500 mb-4">Create a Post</Text>

          <TextInput
            placeholder="Write something..."
            value={description}
            onChangeText={setDescription}
            className="bg-pink-50 border border-pink-200 rounded-xl text-base text-gray-800 px-4 py-3 h-28 mb-4"
            multiline
          />

          {image && (
            <Image
              source={{ uri: image }}
              className="w-full h-52 rounded-xl mb-4"
              resizeMode="cover"
            />
          )}

          <TouchableOpacity onPress={pickImage} className="flex-row items-center self-center mb-6 px-4 py-2 border border-pink-200 bg-pink-50 rounded-full">
            <Ionicons name="image-outline" size={22} color="#e75480" />
            <Text className="ml-2 text-pink-500 font-semibold text-base">Pick Image</Text>
          </TouchableOpacity>

          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="px-6 py-2 bg-gray-100 rounded-xl"
            >
              <Text className="text-gray-600 font-semibold text-base">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAdd}
              className="px-6 py-2 bg-pink-500 rounded-xl shadow-md"
            >
              <Text className="text-white font-bold text-base">Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default AddPostModal