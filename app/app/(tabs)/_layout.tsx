
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { useAuth } from '@lib/context/AuthContext';

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
  const role = (user?.jobRole || user?.role || '').toString().toUpperCase();

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
  {/* Declare all tabs explicitly so options always apply; control visibility later if needed */}
  <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="home" size={size} color={color} />) }} />
  <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="time" size={size} color={color} />) }} />
  <Tabs.Screen name="notification" options={{ title: 'Notification', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="notifications" size={size} color={color} />) }} />
  <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }: TabBarIconProps) => (<Ionicons name="person" size={size} color={color} />) }} />
      {/* Explicitly hide tasks route from tab bar if file exists */}
      <Tabs.Screen name="tasks" options={{ href: null }} />
    </Tabs>
  );
}