import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const settings = () => {
    const {logout} = useAuth()
    const router = useRouter()
    const handleLogout=()=>{
        logout()
        router.replace("/(auth)/login")
    }
  return (
    <View  className='justify-center items-center w-full h-full'>
        <TouchableOpacity onPress={handleLogout}>

      <Text>LogOut</Text>
        </TouchableOpacity>
    </View>
  )
}

export default settings