import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from '../config/database.js';

export { pool, connectDatabase } from '../config/database.js';
export const db = drizzle({ client: pool });
export * from './schema/users.js';
export * from './schema/projects.js';
export * from './schema/documents.js';
export * from './schema/repositories.js';
export * from './schema/chunks.js';
export * from './schema/embeddings.js';
export * from './schema/conversations.js';
export * from './schema/messages.js';
export * from './schema/agent-runs.js';
export * from './schema/sessions.js';
export * from './schema/github-accounts.js';