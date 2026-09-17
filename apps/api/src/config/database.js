import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;
const databaseUrl = new URL(env.databaseUrl);

export const pool = new Pool({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 5432),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.slice(1)
});

export const connectDatabase = async () => {
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected');
};