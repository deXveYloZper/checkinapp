// client/src/screens/RegisterScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('owner');

  const validateEmail = (text) => {
    // Basic regex for demonstration
    const re = /\S+@\S+\.\S+/;
    return re.test(text);
  };

  const handleRegister = async () => {
    // 1) Basic checks
    if (!validateEmail(email)) {
      return Alert.alert('Invalid Email', 'Please provide a valid email address');
    }
    if (password.length < 6) {
      return Alert.alert('Password Too Short', 'Must be at least 6 characters');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Passwords Mismatch', 'Please confirm your password');
    }

    try {
      const response = await axios.post('/auth/register', {
        email, password, role
      });
      Alert.alert('Registration successful', response.data.message);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      Alert.alert(
        'Register Failed',
        error.response?.data?.error || 'Server error'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <View style={styles.roleContainer}>
        <Text>Select Role:</Text>
        <Button
          title="Owner"
          onPress={() => setRole('owner')}
          color={role === 'owner' ? 'green' : 'gray'}
        />
        <Button
          title="Agent"
          onPress={() => setRole('agent')}
          color={role === 'agent' ? 'green' : 'gray'}
        />
      </View>

      <Button title="Register" onPress={handleRegister} />

      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    marginBottom: 12,
    padding: 10,
    borderRadius: 4
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  link: {
    marginTop: 16,
    color: 'blue',
    textAlign: 'center'
  }
});
