import { Stack, Level, Package, LogResponse } from './types.js';
/**
 * Sends a log message to the remote API.
 *
 * @param stack - The stack where the log originated ('backend' | 'frontend')
 * @param level - The severity level ('debug' | 'info' | 'warn' | 'error' | 'fatal')
 * @param pkg - The package name
 * @param message - The log message
 */
export declare function Log(stack: Stack, level: Level, pkg: Package, message: string): Promise<LogResponse | null>;
