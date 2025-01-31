// client/src/screens/owner/CreateCheckInScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from '../../services/api';

export default function CreateCheckInScreen({ navigation }) {
  const [propertyAddress, setPropertyAddress] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [guestCount, setGuestCount] = useState('1');

  const createRequest = async () => {
    try {
      await axios.post('/checkins', {
        propertyAddress,
        checkInTime,
        guestCount: Number(guestCount),
      });
      Alert.alert('Success', 'Check-in request created.');
      navigation.goBack();
    } catch (error) {
      console.error('Create check-in error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Server error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Property Address:</Text>
      <TextInput
        style={styles.input}
        value={propertyAddress}
        onChangeText={setPropertyAddress}
        placeholder="e.g. 123 Firenze Street"
      />

      <Text style={styles.label}>Check-In Time (YYYY-MM-DD HH:mm):</Text>
      <TextInput
        style={styles.input}
        value={checkInTime}
        onChangeText={setCheckInTime}
        placeholder="e.g. 2025-02-10 14:00"
      />

      <Text style={styles.label}>Guest Count:</Text>
      <TextInput
        style={styles.input}
        value={guestCount}
        onChangeText={setGuestCount}
        keyboardType="numeric"
      />

      <Button title="Create" onPress={createRequest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
});
