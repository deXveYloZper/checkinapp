// src/screens/RoleBasedScreen.js

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OwnerStack from './owner/OwnerStack';
import AgentStack from './agent/AgentStack';

const Stack = createNativeStackNavigator();

export default function RoleBasedScreen({ navigation }) {
  useEffect(() => {
    let isMounted = true;

    (async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (!isMounted) return;

      if (role === 'owner') {
        navigation.replace('OwnerStack');
      } else if (role === 'agent') {
        navigation.replace('AgentStack');
      } else {
        navigation.replace('Login');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
