import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '@store/auth/useAuth';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function onSubmit() {
    if (!username || !password) {
      Alert.alert('Harap isi username dan password');
      return;
    }
    login({ id: 'demo-user', name: username });
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 24 }}>Login</Text>
      <Text style={{ marginBottom: 8 }}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
            borderColor: '#ccc',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
        }}
      />
      <Text style={{ marginBottom: 8 }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
            borderColor: '#ccc',
            padding: 12,
            borderRadius: 8,
            marginBottom: 24,
        }}
      />
      <Button title="Masuk" onPress={onSubmit} />
    </View>
  );
};

export default LoginScreen;
