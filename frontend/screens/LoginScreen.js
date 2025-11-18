import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderBottomWidth: 1, marginBottom: 20 }} />
      <Button title="Login" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate('Register')} style={{ marginTop: 20, textAlign: 'center' }}>
        No account? Register
      </Text>
    </View>
  );
};

export default LoginScreen;
