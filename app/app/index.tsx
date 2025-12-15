import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@lib/context/AuthContext';

export default function Index() {
  const { token } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // give AuthProvider a tick to rehydrate token from SecureStore
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;
  if (token) return <Redirect href="/(tabs)/home" />;
  return <Redirect href="/login" />;
}
