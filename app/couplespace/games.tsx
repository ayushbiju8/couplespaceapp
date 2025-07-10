import { useRouter } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'


// Vere pageilekk pokanel
{/* <TouchableOpacity onPress={() => router.push("/otherpages/coupleQuiz")} className='w-full h-10 bg-red-100'>
  <Text>Navigate</Text>
</TouchableOpacity> */}
// Eee saanam vecha mathi page ite peru koduthitt.
// Other pages folder il vere oru page ind vere venel indakiko


const games = () => {
  const router = useRouter()




  return (
    <View>
      <Text>games</Text>
      <TouchableOpacity onPress={() => router.push("/otherpages/coupleQuiz")} className='w-full h-10 bg-red-100'>
        <Text>Navigate</Text>
      </TouchableOpacity>
    </View>
  )
}

export default games