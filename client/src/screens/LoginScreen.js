// client/src/screens/LoginScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      // Expecting server to return: { token, user: { _id, role, name, ... } }
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Login response missing token or user data');
      }

      // Store token & user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', user._id);
      await AsyncStorage.setItem('userRole', user.role);
      await AsyncStorage.setItem('userName', user.name || '');

      // Navigate to the RoleBased screen
      navigation.replace('RoleBased');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || 'Server error'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={(val) => setEmail(val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(val) => setPassword(val)}
      />

      <Button title="Login" onPress={handleLogin} />

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Need an account? Register
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: 16, 
    justifyContent: 'center'
  },
  title: {
    fontSize: 22, 
    marginBottom: 16, 
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    marginBottom: 12,
    padding: 10,
    borderRadius: 4
  },
  link: {
    marginTop: 16, 
    color: 'blue', 
    textAlign: 'center'
  }
});
