import axios from 'axios';
import { Notification } from './types.js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TOKEN = process.env.LOGGING_SERVICE_TOKEN;

const api = axios.create({
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await api.get('http://4.224.186.213/evaluation-service/notifications');
  return response.data.notifications;
}
