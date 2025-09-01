import React from 'react';
import { NavigationContainerRef, DefaultTheme } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';
import { useAuth } from '@store/auth/useAuth';

export const navigationRef: React.RefObject<NavigationContainerRef<any>> = React.createRef();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
  },
};

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return isAuthenticated ? <AppTabs /> : <AuthStack />;
};

export default RootNavigator;
