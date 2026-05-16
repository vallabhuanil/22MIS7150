import axios from 'axios';
import { config, validateConfig } from './config.js';
const ALLOWED_STACKS = ['backend', 'frontend'];
const ALLOWED_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const ALLOWED_PACKAGES = [
    'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
    'api', 'component', 'hook', 'page', 'state', 'style',
    'auth', 'config', 'middleware', 'utils'
];
/**
 * Sends a log message to the remote API.
 *
 * @param stack - The stack where the log originated ('backend' | 'frontend')
 * @param level - The severity level ('debug' | 'info' | 'warn' | 'error' | 'fatal')
 * @param pkg - The package name
 * @param message - The log message
 */
export async function Log(stack, level, pkg, message) {
    // Runtime validation
    if (!ALLOWED_STACKS.includes(stack)) {
        console.error(`[Logging Middleware] Invalid stack: ${stack}`);
        return null;
    }
    if (!ALLOWED_LEVELS.includes(level)) {
        console.error(`[Logging Middleware] Invalid level: ${level}`);
        return null;
    }
    if (!ALLOWED_PACKAGES.includes(pkg)) {
        console.error(`[Logging Middleware] Invalid package: ${pkg}`);
        return null;
    }
    validateConfig();
    const payload = {
        stack,
        level,
        package: pkg,
        message
    };
    try {
        const response = await axios.post(config.endpoint, payload, {
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error(`[Logging Middleware] Failed to send log: ${errorMessage}`);
        return null;
    }
}
