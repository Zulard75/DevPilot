import { Router } from 'express';
import { getHealthController } from '../controllers/health.controller.js';

export const healthRouter = Router();
healthRouter.get('/', getHealthController,(req, res) => {
  res.status(200).json({ status: 'ok' });
});