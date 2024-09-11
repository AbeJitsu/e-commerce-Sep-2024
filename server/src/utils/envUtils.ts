// server/src/utils/envUtils.ts

import dotenv from 'dotenv';

dotenv.config();

// Determines if the environment is set to production
export const isProduction = (): boolean =>
  process.env.NODE_ENV === 'production';

// Determines if the environment is set to use the cloud backend
export const isCloudEnvironment = (): boolean =>
  process.env.SERVER_USE_CLOUD_BACKEND === 'true';

// Determines if the environment is set to use the cloud database
export const isCloudDatabase = (): boolean =>
  process.env.SERVER_USE_CLOUD_DB === 'true';

// Returns the appropriate Backend URL based on the environment
export const getBackendUrl = (): string => {
  return isCloudEnvironment()
    ? process.env.SERVER_CLOUD_BACKEND_URL || ''
    : process.env.SERVER_LOCAL_BACKEND_URL || '';
};

// Returns the appropriate Database URL based on the environment
export const getDatabaseUrl = (): string => {
  return isCloudDatabase()
    ? process.env.SERVER_CLOUD_DATABASE_URL || ''
    : process.env.SERVER_LOCAL_DATABASE_URL || '';
};

// Returns the appropriate Frontend URL based on the environment
export const getFrontendUrl = (): string => {
  return isCloudEnvironment()
    ? process.env.SERVER_CLOUD_FRONTEND_URL || ''
    : process.env.SERVER_LOCAL_FRONTEND_URL || '';
};
