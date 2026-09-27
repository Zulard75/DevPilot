import { Router } from 'express';
import {
  listDocuments,
  getDocumentById,
  createDocumentController
} from '../../controllers/document.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

export const documentsRouter = Router();

documentsRouter.get('/', optionalAuth, listDocuments);
documentsRouter.post('/', optionalAuth, createDocumentController);
documentsRouter.get('/:id', optionalAuth, getDocumentById);