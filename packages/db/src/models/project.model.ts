import { model } from 'mongoose';
import { projectSchema } from '../schema.js';

export type ProjectDocument = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export const Project = model<ProjectDocument>('Project', projectSchema);