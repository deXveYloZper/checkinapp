// client/src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '../navigation/NavigationRef';

const instance = axios.create({
  baseURL: 'http://10.0.2.2:3000', // or your real device IP/domain If you want to run on a real phone, you might replace baseURL: 'http://10.0.2.2:3000' with your machine’s local IP like 'http://192.168.x.x:3000'
  timeout: 5000,
});

// Request interceptor
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired
      console.warn('API 401, logging out...');
      await AsyncStorage.multiRemove(['token', 'userId', 'userRole', 'userName']);
      navigate('Login'); 
      // or navigate('RoleBased') if you want the root to handle it
    }
    return Promise.reject(error);
  }
);

export default instance;
