import 'dotenv/config';

const requiredEnv = (name, fallback = '') => process.env[name] ?? fallback;

export const env = {
  nodeEnv: requiredEnv('NODE_ENV', 'development'),
  port: Number(requiredEnv('PORT', '4000')),
  databaseUrl: requiredEnv('DATABASE_URL'),
  redisUrl: requiredEnv('REDIS_URL'),
  githubClientId: requiredEnv('GITHUB_CLIENT_ID'),
  githubClientSecret: requiredEnv('GITHUB_CLIENT_SECRET'),
  githubCallbackUrl: requiredEnv(
    'GITHUB_CALLBACK_URL',
    'http://localhost:4000/api/v1/auth/github/callback'
  )
};