import dotenv from 'dotenv';

dotenv.config();

type EnvironmentVariable = string | number | boolean;

class Config {
  private static getEnv(
    key: string,
    defaultValue: EnvironmentVariable = ''
  ): EnvironmentVariable {
    const value = process.env[key];
    if (value === undefined) {
      return defaultValue;
    }
    if (typeof defaultValue === 'number') {
      return Number(value);
    }
    if (typeof defaultValue === 'boolean') {
      return value.toLowerCase() === 'true';
    }
    return value;
  }

  static readonly PORT = Config.getEnv('PORT', 3000) as number;
  static readonly NODE_ENV = Config.getEnv('NODE_ENV', 'development') as string;
  static readonly MONGODB_URI = Config.getEnv('MONGODB_URI') as string;
  static readonly SERVER_USE_CLOUD_DB = Config.getEnv(
    'SERVER_USE_CLOUD_DB',
    false
  ) as boolean;
  static readonly SERVER_USE_CLOUD_BACKEND = Config.getEnv(
    'SERVER_USE_CLOUD_BACKEND',
    false
  ) as boolean;
  static readonly SERVER_LOCAL_DATABASE_URL = Config.getEnv(
    'SERVER_LOCAL_DATABASE_URL'
  ) as string;
  static readonly SERVER_CLOUD_DATABASE_URL = Config.getEnv(
    'SERVER_CLOUD_DATABASE_URL'
  ) as string;
  static readonly SERVER_LOCAL_BACKEND_URL = Config.getEnv(
    'SERVER_LOCAL_BACKEND_URL'
  ) as string;
  static readonly SERVER_CLOUD_BACKEND_URL = Config.getEnv(
    'SERVER_CLOUD_BACKEND_URL'
  ) as string;
  static readonly SERVER_LOCAL_FRONTEND_URL = Config.getEnv(
    'SERVER_LOCAL_FRONTEND_URL'
  ) as string;
  static readonly SERVER_CLOUD_FRONTEND_URL = Config.getEnv(
    'SERVER_CLOUD_FRONTEND_URL'
  ) as string;
  static readonly SERVER_SESSION_SECRET = Config.getEnv(
    'SERVER_SESSION_SECRET',
    'default_secret'
  ) as string;
  static readonly SERVER_JWT_SECRET = Config.getEnv(
    'SERVER_JWT_SECRET',
    'default_jwt_secret'
  ) as string;

  static isProduction(): boolean {
    return Config.NODE_ENV === 'production';
  }

  static getDatabaseUrl(): string {
    return Config.SERVER_USE_CLOUD_DB
      ? Config.SERVER_CLOUD_DATABASE_URL
      : Config.SERVER_LOCAL_DATABASE_URL;
  }

  static getBackendUrl(): string {
    return Config.SERVER_USE_CLOUD_BACKEND
      ? Config.SERVER_CLOUD_BACKEND_URL
      : Config.SERVER_LOCAL_BACKEND_URL;
  }

  static getFrontendUrl(): string {
    return Config.SERVER_USE_CLOUD_BACKEND
      ? Config.SERVER_CLOUD_FRONTEND_URL
      : Config.SERVER_LOCAL_FRONTEND_URL;
  }
}

export default Config;
