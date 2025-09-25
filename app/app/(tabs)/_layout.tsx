
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

const COLORS = {
  gold: '#bfa76a',
  dark: '#181512',
  brown: '#3e2723',
  yellow: '#ffe082',
  white: '#fff',
  black: '#111',
  card: '#23201c',
  border: '#4e3f2c',
};

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
        headerStyle: {
          backgroundColor: COLORS.dark,
          borderBottomWidth: 0,
          shadowColor: 'transparent',
        },
        headerTitleStyle: {
          color: COLORS.gold,
          fontWeight: 'bold',
          letterSpacing: 1,
        },
        headerRight: () => (
          <TouchableOpacity onPress={() => logout()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.gold} />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 70 : 60,
          shadowColor: COLORS.gold,
          shadowOpacity: 0.12,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.yellow,
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 12,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
      }}
    >
      {tabScreens}
    </Tabs>
  );
}