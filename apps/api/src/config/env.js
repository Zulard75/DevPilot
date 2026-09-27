import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Attempt to load from multiple standard locations
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const requiredEnv = (name, fallback = '') => process.env[name] ?? fallback;

export const env = {
  nodeEnv: requiredEnv('NODE_ENV', 'development'),
  port: Number(requiredEnv('PORT', '4000')),
  databaseUrl: requiredEnv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/devpilot'),
  redisUrl: requiredEnv('REDIS_URL', 'redis://localhost:6379'),
  githubClientId: requiredEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: requiredEnv('GITHUB_CLIENT_SECRET'),
  githubCallbackUrl: requiredEnv(
    'GITHUB_CALLBACK_URL',
    'http://localhost:4000/api/v1/auth/github/callback'
  )
};