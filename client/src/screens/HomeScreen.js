// client/src/screens/HomeScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedRole = await AsyncStorage.getItem('userRole');
      setToken(storedToken);
      setUserId(storedUserId || '');
      setRole(storedRole || '');
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'userRole', 'userId', 'userName']);
    Alert.alert('Logged out', 'You have been logged out successfully.');
    // Navigate back to login or root
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Home (Debug Screen)</Text>
      <Text>JWT Token: {token || 'No token found'}</Text>
      <Text>User ID: {userId}</Text>
      <Text>User Role: {role}</Text>

      <Button title="Logout" onPress={handleLogout} />
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
    marginBottom: 12,
    textAlign: 'center'
  }
});
