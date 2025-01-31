// client/src/screens/agent/AgentAcceptedRequests.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from '../../services/api';

export default function AgentAcceptedRequests({ navigation }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchAccepted();
  }, []);

  const fetchAccepted = async () => {
    try {
      const res = await axios.get('/checkins?status=accepted');
      setRequests(res.data);
    } catch (error) {
      console.error('AgentAccepted fetch error:', error.response?.data || error.message);
    }
  };

  const goToChat = (requestId) => {
    navigation.navigate('AgentChat', { requestId });
  };

  const markCompleted = async (requestId) => {
    try {
      await axios.post(`/checkins/${requestId}/complete`);
      Alert.alert('Request completed!');
      fetchAccepted();
    } catch (error) {
      console.error('Complete error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Server error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Accepted Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Property: {item.propertyAddress}</Text>
            <Text>Status: {item.status}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => goToChat(item._id)}>
                <Text style={styles.chatLink}>Chat</Text>
              </TouchableOpacity>
              {item.status === 'accepted' && (
                <TouchableOpacity onPress={() => markCompleted(item._id)}>
                  <Text style={styles.completeLink}>Mark Completed</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, marginBottom: 12, fontWeight: '500' },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  chatLink: { color: 'blue' },
  completeLink: { color: 'green' }
});
