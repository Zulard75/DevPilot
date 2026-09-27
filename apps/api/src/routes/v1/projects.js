import { Router } from 'express';
import {
  listProjects,
  getProjectById,
  createProjectController,
  deleteProjectController
} from '../../controllers/project.controller.js';
import { optionalAuth, requireAuth } from '../../middleware/auth.js';

export const projectsRouter = Router();

projectsRouter.get('/', optionalAuth, listProjects);
projectsRouter.post('/', optionalAuth, createProjectController);
projectsRouter.get('/:id', optionalAuth, getProjectById);
projectsRouter.delete('/:id', optionalAuth, deleteProjectController);