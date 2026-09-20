import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getRepositories } from "../../controllers/github.controller.js";

export const githubRouter = express.Router();

githubRouter.get(
	"/repositories",
	requireAuth,
	getRepositories
);

export default githubRouter;
