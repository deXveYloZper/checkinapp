// App.js
import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestUserPermission, handleBackgroundMessage, handleForegroundMessage } from './src/utils/notifications';
import RootNavigator from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/NavigationRef';
import { AppState, Platform } from 'react-native';
// Example crash/analytics placeholders
// import analytics from '@react-native-firebase/analytics';
// import * as Sentry from '@sentry/react-native';

messaging().setBackgroundMessageHandler(handleBackgroundMessage);

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');

  // If user logs out or token changes, we can re-check
  const recheckAuth = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    const role = await AsyncStorage.getItem('userRole');
    if (token && role) {
      setInitialRoute('RoleBased');
    } else {
      setInitialRoute('Login');
    }
  }, []);

  useEffect(() => {
    // 1) Request iOS permission if needed
    requestUserPermission();

    // 2) Foreground listener for FCM
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      handleForegroundMessage(remoteMessage);
    });

    // 3) Check if user is already logged in initially
    recheckAuth();

    // 4) Example analytics/crash initialization
    // analytics().logAppOpen();
    // Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });

    // 5) Listen for app resume or token changes
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        // Re-check if token changed while backgrounded
        await recheckAuth();
      }
    });

    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, [recheckAuth]);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator initialRoute={initialRoute} />
    </NavigationContainer>
  );
}
