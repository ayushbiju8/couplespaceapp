import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, Text, TouchableOpacity, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SettingItem = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };


  return (
    <View className="bg-white/90 rounded-xl mx-4 mt-3 overflow-hidden">
      <TouchableOpacity
        onPress={toggleExpand}
        className="flex-row justify-between items-center p-4"
      >
        <Text className="text-base text-gray-800 font-medium">{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#D81B60"
        />
      </TouchableOpacity>
      {expanded && <View className="px-4 pb-4">{children}</View>}
    </View>
  );
};

const SettingsPage = () => {
  const { logout } = useAuth()
  const router = useRouter()
  const handleLogout = () => {
    logout()
    router.replace("/(auth)/login")
  }
  return (
    <ScrollView className="flex-1 bg-pink-50 pt-10">
      <Text className="text-2xl font-bold text-pink-700 px-5 mb-4">Settings</Text>

      <SettingItem title="Account">
        <Text className="text-gray-600 mb-1">Change password</Text>
        <Text className="text-gray-600 mb-1">Update email</Text>
        <Text className="text-gray-600">Manage devices</Text>
      </SettingItem>

      <SettingItem title="Notifications">
        <Text className="text-gray-600 mb-1">Push notifications</Text>
        <Text className="text-gray-600 mb-1">Email preferences</Text>
        <Text className="text-gray-600">SMS alerts</Text>
      </SettingItem>

      <SettingItem title="Privacy">
        <Text className="text-gray-600 mb-1">Blocked users</Text>
        <Text className="text-gray-600">Activity status</Text>
      </SettingItem>

      <SettingItem title="Terms and Conditions">
        <Text className="text-gray-600">
          These are the terms and conditions. You agree to be nice and respectful. No spamming, no trolling
          (unless it’s funny), and please don’t sue us.
        </Text>
      </SettingItem>

      <SettingItem title="Help & Support">
        <Text className="text-gray-600 mb-1">FAQs</Text>
        <Text className="text-gray-600 mb-1">Contact support</Text>
        <Text className="text-gray-600">Report a bug</Text>
      </SettingItem>

      {/* Sign out - Add backend logic later */}
      <TouchableOpacity
        onPress={handleLogout}
        className="mx-5 my-8"
      >
        <Text className="text-red-500 text-base font-semibold text-center">Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsPage;