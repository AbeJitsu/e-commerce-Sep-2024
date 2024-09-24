import dotenv from 'dotenv';
import { EnvironmentVariableError } from './dbUtils';
import { configService } from '../services/configService';

dotenv.config();

type EnvVar = string | undefined;

const getEnvVar = (key: string): EnvVar => process.env[key];

const requireEnvVar = (key: string): string => {
  const value = getEnvVar(key);
  if (value === undefined) {
    throw new EnvironmentVariableError(
      `Environment variable ${key} is not set`
    );
  }
  return value;
};

const toBool = (value: EnvVar): boolean => value === 'true';

const toNumber = (value: EnvVar, defaultValue?: number): number => {
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new EnvironmentVariableError(
      'Value is undefined and no default provided'
    );
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new EnvironmentVariableError(
      `Value "${value}" cannot be converted to a number`
    );
  }
  return num;
};

export const NODE_ENV = getEnvVar('NODE_ENV');
export const PORT = toNumber(getEnvVar('PORT'), 3001);

export const isProduction = (): boolean => NODE_ENV === 'production';

let configServiceInitialized = false;

export const initializeConfigService = async (): Promise<void> => {
  if (!configServiceInitialized) {
    await configService.connect();
    configServiceInitialized = true;
  }
};

export const isCloudEnvironment = async (): Promise<boolean> => {
  await initializeConfigService();
  const config = await configService.getConfig();
  return config.useCloudBackend;
};

export const isCloudDatabase = async (): Promise<boolean> => {
  await initializeConfigService();
  const config = await configService.getConfig();
  return config.useCloudDatabase;
};

export const getBackendUrl = async (): Promise<string> => {
  const isCloud = await isCloudEnvironment();
  return isCloud
    ? requireEnvVar('SERVER_CLOUD_BACKEND_URL')
    : requireEnvVar('SERVER_LOCAL_BACKEND_URL');
};

export const getDatabaseUrl = async (): Promise<string> => {
  const isCloud = await isCloudDatabase();
  return isCloud
    ? requireEnvVar('MONGODB_URI')
    : requireEnvVar('SERVER_LOCAL_DATABASE_URL');
};

export const getFrontendUrl = async (): Promise<string> => {
  const isCloud = await isCloudEnvironment();
  return isCloud
    ? requireEnvVar('SERVER_CLOUD_FRONTEND_URL')
    : requireEnvVar('SERVER_LOCAL_FRONTEND_URL');
};

export const getSessionSecret = (): string =>
  requireEnvVar('SERVER_SESSION_SECRET');
export const getJwtSecret = (): string => requireEnvVar('SERVER_JWT_SECRET');
export const getSquareAccessToken = (): string =>
  requireEnvVar('SERVER_SQUARE_ACCESS_TOKEN');

export const getPort = (): number => PORT;

export const validateEnvVariables = (): void => {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'SERVER_LOCAL_DATABASE_URL',
    'SERVER_CLOUD_BACKEND_URL',
    'SERVER_LOCAL_BACKEND_URL',
    'SERVER_CLOUD_FRONTEND_URL',
    'SERVER_LOCAL_FRONTEND_URL',
    'SERVER_SESSION_SECRET',
    'SERVER_JWT_SECRET',
    'SERVER_SQUARE_ACCESS_TOKEN',
  ];

  requiredVars.forEach(requireEnvVar);
};

// server/src/utils/envUtils.ts
