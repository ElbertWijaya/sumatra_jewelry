import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/client';

export const LoginScreen: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@tokomas.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // API base override UI removed (now fixed base)

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      await login(email, password);
      onSuccess && onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize='none' placeholder='Email' />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder='Password' secureTextEntry />
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={{ height:12 }} />
  <View style={{ height:18 }} />
      <Button title={loading ? '...' : 'Login'} onPress={submit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12 },
  // baseLabel removed
});
