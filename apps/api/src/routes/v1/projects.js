import { Router } from 'express';
import { listProjects } from '../../controllers/project.controller.js';

export const projectsRouter = Router();
projectsRouter.get('/', listProjects);