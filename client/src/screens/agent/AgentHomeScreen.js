// client/src/screens/agent/AgentHomeScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from '../../services/api';

export default function AgentHomeScreen({ navigation }) {
  const [openRequests, setOpenRequests] = useState([]);

  useEffect(() => {
    fetchOpenRequests();
  }, []);

  const fetchOpenRequests = async () => {
    try {
      const response = await axios.get('/checkins'); // agent sees open
      setOpenRequests(response.data);
    } catch (error) {
      console.error('AgentHome fetch error:', error.response?.data || error.message);
    }
  };

  const acceptRequest = async (request) => {
    try {
      await axios.post(`/checkins/${request._id}/accept`);
      Alert.alert('Request accepted!');
      // Now item.status=accepted. Could navigate to chat
      navigation.navigate('AgentChat', { requestId: request._id });
      fetchOpenRequests();
    } catch (error) {
      console.error('Accept error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Server error');
    }
  };

  const goToChat = (request) => {
    // Only if status=accepted
    if (request.status !== 'accepted') {
      return;
    }
    navigation.navigate('AgentChat', { requestId: request._id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Open Requests</Text>
      <FlatList
        data={openRequests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <Text>Property: {item.propertyAddress}</Text>
            <Text>CheckIn: {item.checkInTime}</Text>
            {item.status === 'open' && (
              <TouchableOpacity onPress={() => acceptRequest(item)}>
                <Text style={styles.acceptBtn}>Accept</Text>
              </TouchableOpacity>
            )}

            {/* If status is accepted, show a "Chat" button */}
            {item.status === 'accepted' && (
              <TouchableOpacity onPress={() => goToChat(item)}>
                <Text style={styles.chatBtn}>Chat</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('AgentAcceptedRequests')}
      >
        <Text style={styles.link}>View My Accepted Requests</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, marginBottom: 12, fontWeight: '500' },
  requestItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  acceptBtn: { color: 'blue', marginTop: 6 },
  chatBtn: { color: 'green', marginTop: 6 },
  link: {
    color: 'blue',
    marginTop: 16,
    textAlign: 'center',
  },
});
