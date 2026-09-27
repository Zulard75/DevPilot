import { Router } from 'express';
import { listDocuments, getDocumentById } from '../../controllers/document.controller.js';

export const documentsRouter = Router();

documentsRouter.get('/', listDocuments);
documentsRouter.get('/:id', getDocumentById);