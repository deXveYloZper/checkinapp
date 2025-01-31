// client/App.js (simplified example)
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

function App() {
  useEffect(() => {
    // Request permission (for iOS). On Android, it’s often granted by default for FCM.
    messaging().requestPermission().then(authStatus => {
      console.log('FCM auth status:', authStatus);
    });

    // Get the device token
    messaging()
      .getToken()
      .then(fcmToken => {
        console.log('FCM Token:', fcmToken);
        // send fcmToken to the server if user is authenticated
        // e.g. axios.post('/user/fcmToken', { fcmToken }, { headers: { Authorization: 'Bearer XXX' } })
      });

    // Optional: listen for token refresh
    const unsubscribe = messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      // same logic: send updated token to server
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={{ marginTop: 50 }}>
      <Text>Welcome to Firenze Check-In App with FCM!</Text>
    </View>
  );
}

export default App;
