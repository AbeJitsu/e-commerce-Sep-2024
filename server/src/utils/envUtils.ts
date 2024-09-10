// server/src/utils/envUtils.ts

// Helper function to get a required environment variable
const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

export const isCloudEnvironment = (): boolean =>
  process.env.SERVER_USE_CLOUD_DB === 'true';

export const getFrontendUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return getRequiredEnvVar('SERVER_PRODUCTION_FRONTEND_URL');
  }
  return process.env.SERVER_LOCAL_FRONTEND_URL || 'http://localhost:9000';
};

export const getApiUrl = (): string => {
  if (isCloudEnvironment()) {
    return getRequiredEnvVar('SERVER_CLOUD_DATABASE_URL');
  }
  return getRequiredEnvVar('SERVER_LOCAL_DATABASE_URL');
};

export const getJwtSecret = (): string =>
  getRequiredEnvVar('SERVER_JWT_SECRET');

export const getNodeEnv = (): string => process.env.NODE_ENV || 'development';

export const isProduction = (): boolean => getNodeEnv() === 'production';
