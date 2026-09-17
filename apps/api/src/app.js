import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { requestLogger } from './middleware/request-logger.js';
import routes from "./routes/index.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(routes);
app.use(requestLogger);
app.use(notFound);
app.use(errorHandler);