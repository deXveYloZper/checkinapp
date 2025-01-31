// client/src/screens/ChatScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import io from 'socket.io-client';

export default function ChatScreen({ route }) {
  const { token, requestId } = route.params; // you pass them when navigating
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    // connect to your server
    const newSocket = io('http://10.0.2.2:3000', {
      auth: {
        token // pass the JWT for socket auth
      }
    });

    // on connect, join the request room
    newSocket.on('connect', () => {
      console.log('Socket connected!', newSocket.id);
      newSocket.emit('joinRequestRoom', requestId);
    });

    // listen for incoming messages
    newSocket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    setSocket(newSocket);

    // cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [token, requestId]);

  const sendMessage = () => {
    if (socket && text.trim()) {
      socket.emit('message', { requestId, text });
      setText('');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 2 }}>
            {item.user}: {item.text}
          </Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 8 }}
        value={text}
        onChangeText={setText}
        placeholder="Type your message..."
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
}
