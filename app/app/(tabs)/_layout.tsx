import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

type TabBarIconProps = { color: string; size: number };

export default function TabLayout() {
  const { logout, user } = useAuth();
  const role = user?.role;

  let tabScreens;
  if (role === 'bos') {
    tabScreens = [
      <Tabs.Screen key="home" name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="home" size={size} color={color} />) }} />,
      <Tabs.Screen key="history" name="history" options={{ title: 'History', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="time" size={size} color={color} />) }} />,
      <Tabs.Screen key="notification" name="notification" options={{ title: 'Notification', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="notifications" size={size} color={color} />) }} />,
      <Tabs.Screen key="profile" name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="person" size={size} color={color} />) }} />,
    ];
  } else if (role === 'sales') {
    tabScreens = [
      <Tabs.Screen key="home" name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="home" size={size} color={color} />) }} />,
      <Tabs.Screen key="history" name="history" options={{ title: 'History', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="time" size={size} color={color} />) }} />,
      <Tabs.Screen key="notification" name="notification" options={{ title: 'Notification', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="notifications" size={size} color={color} />) }} />,
      <Tabs.Screen key="profile" name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="person" size={size} color={color} />) }} />,
    ];
  } else if (["designer","caster","carver","diamond-setter","finisher"].includes(role)) {
    tabScreens = [
      <Tabs.Screen key="home" name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="home" size={size} color={color} />) }} />,
      <Tabs.Screen key="tasks" name="tasks" options={{ title: 'Tasks', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="construct" size={size} color={color} />) }} />,
      <Tabs.Screen key="profile" name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="person" size={size} color={color} />) }} />,
    ];
  } else {
    // fallback: selalu render Home & Profile agar tidak kosong
    tabScreens = [
      <Tabs.Screen key="home" name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="home" size={size} color={color} />) }} />,
      <Tabs.Screen key="profile" name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="person" size={size} color={color} />) }} />,
    ];
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={() => logout()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="log-out-outline" size={20} color="#c62828" />
          </TouchableOpacity>
        ),
      }}
    >
      {tabScreens}
    </Tabs>
  );
}