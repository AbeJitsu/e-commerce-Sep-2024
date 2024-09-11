import Config from '../config/config';

// Re-export isProduction for backwards compatibility
export const isProduction = Config.isProduction;

// Determines if the environment is set to use the cloud backend
export const isCloudEnvironment = (): boolean => Config.SERVER_USE_CLOUD_BACKEND;

// Determines if the environment is set to use the cloud database
export const isCloudDatabase = (): boolean => Config.SERVER_USE_CLOUD_DB;

// Re-export URL getters for backwards compatibility
export const getBackendUrl = Config.getBackendUrl;
export const getDatabaseUrl = Config.getDatabaseUrl;
export const getFrontendUrl = Config.getFrontendUrl;

// Add any additional environment-related utility functions here
// For example:
export const getEnvironmentName = (): string => {
  if (isProduction()) return 'Production';
  if (isCloudEnvironment()) return 'Cloud Development';
  return 'Local Development';
};
