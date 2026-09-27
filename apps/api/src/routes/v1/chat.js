import { Router } from 'express';
import { createChatMessage, getChatMessage } from '../../controllers/chat.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

export const chatRouter = Router();

chatRouter.post('/', optionalAuth, createChatMessage);
chatRouter.get('/', optionalAuth, getChatMessage);
