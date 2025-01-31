// client/src/utils/notifications.js

import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { navigate } from '../navigation/NavigationRef';

export async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      console.log('iOS permission granted:', authStatus);
    } else {
      console.log('iOS permission denied');
    }
  } else {
    console.log('Android push notifications are auto-granted.');
  }
}

export async function handleBackgroundMessage(remoteMessage) {
  console.log('Message handled in the background:', remoteMessage);
  // Possibly queue or do background tasks here
}

export async function handleForegroundMessage(remoteMessage) {
  // Suppose remoteMessage looks like:
  // {
  //   notification: { title, body },
  //   data: { screen, requestId, fullMessage }
  // }
  const notification = remoteMessage.notification;
  const data = remoteMessage.data || {};

  const title = notification?.title || 'New Notification';
  const body = notification?.body || data.fullMessage || 'Check details';

  Alert.alert(
    title,
    body,
    [
      {
        text: 'View',
        onPress: () => {
          // Example logic: if data.screen is "AgentChat" or "OwnerChat" 
          // and data.requestId is set, navigate there
          if (data.screen && data.requestId) {
            navigate(data.screen, { requestId: data.requestId });
          } else {
            // fallback
            navigate('RoleBased');
          }
        }
      },
      { text: 'Ignore', style: 'cancel' }
    ]
  );
}
