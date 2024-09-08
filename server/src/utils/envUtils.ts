// server/src/utils/envUtils.ts

export const isCloudEnvironment = (): boolean => 
  process.env.SERVER_USE_CLOUD_DB === 'true';

export const getFrontendUrl = (): string => 
  process.env.NODE_ENV === 'production'
    ? process.env.SERVER_PRODUCTION_FRONTEND_URL || ''
    : process.env.SERVER_LOCAL_FRONTEND_URL || 'http://localhost:9000';

export const getApiUrl = (): string => 
  isCloudEnvironment()
    ? process.env.SERVER_CLOUD_DATABASE_URL || ''
    : process.env.SERVER_LOCAL_DATABASE_URL || '';
