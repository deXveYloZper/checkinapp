// client/src/screens/ChatScreen.js (enhanced bubble design)

import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import io from 'socket.io-client';
import axios from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen({ route, navigation }) {
  const { requestId } = route.params;
  
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [myUserId, setMyUserId] = useState('');
  const [loading, setLoading] = useState(true);

  // 1) Load user ID + chat history
  useEffect(() => {
    (async () => {
      const userId = await AsyncStorage.getItem('userId');
      setMyUserId(userId || '');
      await fetchOfflineMessages();
    })();
  }, [requestId]);

  const fetchOfflineMessages = async () => {
    try {
      const res = await axios.get(`/chat/${requestId}`);
      const sorted = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(sorted);
    } catch (error) {
      console.error('Fetch chat error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2) Initialize socket
  useEffect(() => {
    const setupSocket = async () => {
      const token = await AsyncStorage.getItem('token');
      const newSocket = io('http://10.0.2.2:3000', { auth: { token } });

      newSocket.on('connect', () => {
        newSocket.emit('joinRequestRoom', requestId);
      });

      newSocket.on('message', (msg) => {
        setMessages(prev => {
          const updated = [...prev, msg];
          return updated.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
      });

      setSocket(newSocket);
    };
    setupSocket();

    return () => {
      socket?.disconnect();
    };
  }, [requestId]);

  // 3) Send message
  const sendMessage = async () => {
    if (!text.trim()) return;
    if (socket && socket.connected) {
      socket.emit('message', { requestId, text });
    } else {
      // fallback
      try {
        const res = await axios.post(`/chat/${requestId}`, { text });
        const newMsg = res.data.chatMsg;
        setMessages(prev => [...prev, newMsg].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      } catch (error) {
        console.error('Fallback msg error:', error.response?.data || error.message);
      }
    }
    setText('');
  };

  // 4) Render bubble
  const renderItem = ({ item }) => {
    const sender = item.user || item.senderId; // from socket or REST
    const isMine = sender === myUserId;
    const bubbleStyle = isMine ? styles.myBubble : styles.otherBubble;
    const bubbleTextStyle = isMine ? styles.myBubbleText : styles.otherBubbleText;

    return (
      <View style={[styles.bubbleContainer, isMine ? styles.myBubbleContainer : styles.otherBubbleContainer]}>
        <View style={bubbleStyle}>
          <Text style={bubbleTextStyle}>{item.text}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Text>Loading chat...</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1, padding: 8 },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 8,
    borderRadius: 4,
    paddingHorizontal: 8
  },
  bubbleContainer: {
    marginVertical: 4
  },
  myBubbleContainer: {
    alignItems: 'flex-end'
  },
  otherBubbleContainer: {
    alignItems: 'flex-start'
  },
  myBubble: {
    backgroundColor: '#DCF8C6',
    padding: 8,
    borderRadius: 8,
    maxWidth: '80%'
  },
  otherBubble: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    maxWidth: '80%'
  },
  myBubbleText: {
    color: '#000'
  },
  otherBubbleText: {
    color: '#000'
  }
});
