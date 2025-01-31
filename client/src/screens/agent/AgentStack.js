// client/src/screens/agent/AgentStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AgentHomeScreen from './AgentHomeScreen';
import AgentAcceptedRequests from './AgentAcceptedRequests';
import ChatScreen from '../ChatScreen';

const Stack = createNativeStackNavigator();

export default function AgentStack() {
  return (
    <Stack.Navigator
      initialRouteName="AgentHome"
      screenOptions={{
        headerStyle: { backgroundColor: '#f2f2f2' },
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="AgentHome"
        component={AgentHomeScreen}
        options={{ title: 'Agent Home' }}
      />
      <Stack.Screen
        name="AgentAcceptedRequests"
        component={AgentAcceptedRequests}
        options={{ title: 'Accepted Requests' }}
      />
      <Stack.Screen
        name="AgentChat"
        component={ChatScreen}
        options={{ title: 'Chat' }}
      />
    </Stack.Navigator>
  );
}
