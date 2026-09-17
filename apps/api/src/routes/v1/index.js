import { Router } from 'express';
import { healthRouter } from '../health.js';
import { authRouter } from './auth.js';
import { documentsRouter } from './documents.js';
import { projectsRouter } from './projects.js';
import { usersRouter } from './users.js';
import { githubRouter } from './github.js';
import { chatRouter } from './chat.js';
import { agentRouter } from './agent.js';
import { aiRouter } from './ai.js';

export const v1Router = Router();
v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/projects', projectsRouter);
v1Router.use('/documents', documentsRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/github', githubRouter);
v1Router.use('/chat', chatRouter);
v1Router.use('/agent', agentRouter);
v1Router.use('/ai', aiRouter);

export default v1Router;