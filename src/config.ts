/**
 * Configuration utilities for HivePublisher
 * Handles environment variables and default configurations
 */

import { HiveConfig } from './types.js';

/**
 * Environment configuration for HivePublisher
 */
export interface HiveEnvConfig {
  username?: string;
  postingKey?: string;
  apiNode?: string;
  testnet?: boolean;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Load configuration from environment variables
 */
export function loadEnvConfig(): HiveEnvConfig {
  // Check if we're in a browser environment
  if (typeof process === 'undefined' || !process.env) {
    return {};
  }

  const config: HiveEnvConfig = {};

  // Load credentials
  if (process.env.HIVE_USERNAME) {
    config.username = process.env.HIVE_USERNAME;
  }

  if (process.env.HIVE_POSTING_KEY) {
    config.postingKey = process.env.HIVE_POSTING_KEY;
  }

  // Load network configuration
  if (process.env.HIVE_API_NODE) {
    config.apiNode = process.env.HIVE_API_NODE;
  }
  if (process.env.HIVE_TESTNET) {
    const testnetValue = process.env.HIVE_TESTNET.toLowerCase().trim();
    config.testnet = ['true', '1', 'yes', 'on', 'enable', 'enabled'].includes(testnetValue);
  }

  if (process.env.HIVE_TIMEOUT) {
    const timeout = parseInt(process.env.HIVE_TIMEOUT, 10);
    if (!isNaN(timeout)) {
      config.timeout = timeout;
    }
  }

  if (process.env.HIVE_MAX_RETRIES) {
    const maxRetries = parseInt(process.env.HIVE_MAX_RETRIES, 10);
    if (!isNaN(maxRetries)) {
      config.maxRetries = maxRetries;
    }
  }

  return config;
}

/**
 * Create HiveConfig from environment variables
 */
export function createConfigFromEnv(): HiveConfig {
  const envConfig = loadEnvConfig();

  const config: HiveConfig = {};

  if (envConfig.apiNode) {
    config.apiNode = envConfig.apiNode;
  }

  if (envConfig.testnet !== undefined) {
    config.mainnet = !envConfig.testnet; // Invert testnet to mainnet
  }

  if (envConfig.timeout) {
    config.timeout = envConfig.timeout;
  }

  if (envConfig.maxRetries) {
    config.maxRetries = envConfig.maxRetries;
  }

  return config;
}

import { HiveClient } from './hive-client.js';

/**
 * Get default client based on environment configuration
 */
export function getDefaultClient(): HiveClient {
  const config = createConfigFromEnv();
  return new HiveClient(config);
}

/**
 * Get credentials from environment variables
 */
export function getEnvCredentials(): { username?: string; postingKey?: string } {
  const envConfig = loadEnvConfig();

  return {
    username: envConfig.username,
    postingKey: envConfig.postingKey,
  };
}
