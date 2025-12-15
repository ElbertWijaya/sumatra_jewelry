import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@lib/context/AuthContext';
import { LoginScreen } from '@features/auth/screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string, remember?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await login(email, password, !!remember);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      const msg = e?.message || 'Login gagal. Coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LoginScreen onLogin={handleLogin} loading={loading} error={error} />
    </View>
  );
}
