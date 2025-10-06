import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider, useAuth } from '@lib/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginScreen } from '@features/auth/screens/LoginScreen';
import * as SplashScreen from 'expo-splash-screen';
// import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '../components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const qc = new QueryClient();


import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

const Gate: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { token, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const prevToken = useRef<string | null>(null);

  useEffect(() => {
    // Jika token baru saja didapat (login sukses), redirect ke /home
    if (token && !prevToken.current) {
      router.replace('/home');
    }
    prevToken.current = token;
  }, [token]);

  if (!token) {
    return (
      <LoginScreen
        onLogin={async (email, password) => {
          setLoading(true);
          setError(null);
          try {
            await login(email, password);
          } catch (e: any) {
            setError(e.message || 'Login gagal');
          } finally {
            setLoading(false);
          }
        }}
        loading={loading}
        error={error}
      />
    );
  }
  return <>{children}</>;
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <QueryClientProvider client={qc}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Gate>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </Gate>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
