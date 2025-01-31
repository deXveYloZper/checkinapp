// client/src/screens/owner/OwnerHomeScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Picker } from 'react-native';
import axios from '../../services/api';

export default function OwnerHomeScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState(''); // empty => show all

  useEffect(() => {
    fetchMyRequests();
  }, [statusFilter]);

  const fetchMyRequests = async () => {
    try {
      // If statusFilter is not empty, pass ?status=xxx
      let endpoint = '/checkins';
      if (statusFilter) {
        endpoint += `?status=${statusFilter}`;
      }
      const response = await axios.get(endpoint);
      setRequests(response.data);
    } catch (error) {
      console.error('OwnerHome fetch error:', error.response?.data || error.message);
    }
  };

  const goToChat = (request) => {
    if (!request.agentId) {
      // no agent => can't chat
      return;
    }
    navigation.navigate('OwnerChat', { requestId: request._id });
  };

  return (
    <View style={styles.container}>
      <Button title="Create New Check-In" onPress={() => navigation.navigate('CreateCheckIn')} />

      <View style={styles.filterRow}>
        <Text style={styles.label}>Filter Status:</Text>
        <Picker
          selectedValue={statusFilter}
          style={styles.picker}
          onValueChange={(itemValue) => setStatusFilter(itemValue)}
        >
          <Picker.Item label="All" value="" />
          <Picker.Item label="Open" value="open" />
          <Picker.Item label="Accepted" value="accepted" />
          <Picker.Item label="Completed" value="completed" />
        </Picker>
      </View>

      <Text style={styles.title}>My Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <Text>Property: {item.propertyAddress}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Agent: {item.agentId || 'None'}</Text>
            {item.agentId && (
              <TouchableOpacity onPress={() => goToChat(item)}>
                <Text style={styles.chatLink}>Chat with Agent</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8
  },
  label: { marginRight: 8 },
  picker: { height: 40, flex: 1 },
  title: { fontSize: 18, marginVertical: 12 },
  requestItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 4
  },
  chatLink: {
    color: 'blue',
    marginTop: 6
  }
});
