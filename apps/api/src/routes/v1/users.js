import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { getCurrentUser, getUser } from '../../controllers/user.controller.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, getCurrentUser);
usersRouter.get('/:id', requireAuth, getUser);
