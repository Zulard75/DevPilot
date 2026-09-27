import { Router } from 'express';
import { listProjects, getProjectById } from '../../controllers/project.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

export const projectsRouter = Router();

projectsRouter.get('/', optionalAuth, listProjects);
projectsRouter.get('/:id', optionalAuth, getProjectById);