// server/services/fcm.js

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY || '';

export async function sendFCMNotification(token, title, body, data = {}) {
  const endpoint = 'https://fcm.googleapis.com/fcm/send';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `key=${FCM_SERVER_KEY}`
  };

  const payload = {
    to: token,
    notification: {
      title,
      body
    },
    data // additional custom data (e.g. { requestId, chatId, ... })
  };

  try {
    const response = await axios.post(endpoint, payload, { headers });
    console.log('FCM send result:', response.data);
  } catch (error) {
    console.error('FCM send error:', error.response?.data || error.message);
  }
}
