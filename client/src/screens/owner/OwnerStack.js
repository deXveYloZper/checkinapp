// src/screens/owner/OwnerStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OwnerHomeScreen from './OwnerHomeScreen';
import CreateCheckInScreen from './CreateCheckInScreen';
import ChatScreen from '../ChatScreen';

const Stack = createNativeStackNavigator();

export default function OwnerStack() {
  return (
    <Stack.Navigator
      initialRouteName="OwnerHome"
      screenOptions={{
        headerStyle: { backgroundColor: '#f2f2f2' },
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="OwnerHome"
        component={OwnerHomeScreen}
        options={{ title: 'Owner Home' }}
      />
      <Stack.Screen
        name="CreateCheckIn"
        component={CreateCheckInScreen}
        options={{ title: 'Create Check-In' }}
      />
      <Stack.Screen
        name="OwnerChat"
        component={ChatScreen}
        options={{ title: 'Chat with Agent' }}
      />
    </Stack.Navigator>
  );
}
