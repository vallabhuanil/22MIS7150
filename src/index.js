export * from './types.js';
export { Log } from './logger.js';
// Test call
import { Log } from './logger.js';
Log('backend', 'info', 'middleware', 'Logging middleware initialized successfully')
    .then((res) => console.log('Success:', res))
    .catch((err) => console.error('Error:', err));
