import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  endpoint: 'http://4.224.186.213/evaluation-service/logs',
  token: process.env.LOGGING_SERVICE_TOKEN,
};

export function validateConfig() {
  if (!config.token) {
    console.warn('[Logging Middleware] WARNING: LOGGING_SERVICE_TOKEN is not set in environment variables.');
  }
}
