import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '@screens/Dashboard/DashboardScreen';
import ProductListScreen from '@screens/Products/ProductListScreen';
import { Text } from 'react-native';

export type AppTabsParamList = {
  Dashboard: undefined;
  Products: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

const AppTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Dashboard</Text>,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductListScreen}
        options={{
          tabBarLabel: ({ color }) => <Text style={{ color }}>Produk</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;
