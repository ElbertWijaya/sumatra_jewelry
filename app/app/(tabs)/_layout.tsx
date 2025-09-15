import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function TabLayout() {
  const { logout } = useAuth();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={() => logout()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="log-out-outline" size={20} color="#c62828" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color, size }) => (<Ionicons name="list" size={size} color={color} />) }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: ({ color, size }) => (<Ionicons name="construct" size={size} color={color} />) }} />
      <Tabs.Screen name="work" options={{ title: 'My Work', tabBarIcon: ({ color, size }) => (<Ionicons name="person" size={size} color={color} />) }} />
    </Tabs>
  );
}
