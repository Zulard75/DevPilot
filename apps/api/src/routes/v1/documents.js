import { Router } from 'express';
import { listDocuments } from '../../controllers/document.controller.js';

export const documentsRouter = Router();
documentsRouter.get('/', listDocuments);