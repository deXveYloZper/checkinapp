// src/navigation/RootNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RoleBasedScreen from '../screens/RoleBasedScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator({ initialRoute }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: '#f0f0f0' }, // example style
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }} // hide header on Login
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Register', headerShown: true }} 
      />
      <Stack.Screen
        name="RoleBased"
        component={RoleBasedScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}


// if i add splash i might do: <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />

