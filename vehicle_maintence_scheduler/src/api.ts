import axios from 'axios';
import { Depot, VehicleTask } from './types.js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // Look for .env in the parent directory

const TOKEN = process.env.LOGGING_SERVICE_TOKEN;

const api = axios.create({
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

export async function fetchDepots(): Promise<Depot[]> {
  const response = await api.get('http://4.224.186.213/evaluation-service/depots');
  return response.data.depots;
}

export async function fetchVehicles(): Promise<VehicleTask[]> {
  const response = await api.get('http://4.224.186.213/evaluation-service/vehicles');
  return response.data.vehicles;
}
