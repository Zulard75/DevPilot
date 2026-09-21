import express from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
	getRepositories,
	ingestGithubRepository,
	getGithubRepositoryFilesController
} from "../../controllers/github.controller.js";
import { cloneRepository } from "../../services/git/clone.service.js";
import { getRepositoryPath } from "../../services/git/path.service.js";
import {
	findRepositoryByUser,
	updateRepositoryPath
} from "../../repositories/repository.repository.js";
import { findGithubAccountByUserId } from "../../repositories/github-account.repository.js";

export const githubRouter = express.Router();

githubRouter.get(
	"/repositories",
	requireAuth,
	getRepositories
);

githubRouter.get(
	"/repositories/:repositoryId/files",
	requireAuth,
	getGithubRepositoryFilesController
);

githubRouter.post(
	"/repositories/:repositoryId/ingest",
	requireAuth,
	ingestGithubRepository
);

githubRouter.post(
	"/repositories/:repositoryId/clone",
	requireAuth,
	async (req, res) => {
		try {
			const repositoryId = Number(req.params.repositoryId);
			const repository = await findRepositoryByUser(
				repositoryId,
				req.user.id
			);

			if (!repository) {
				return res.status(403).json({
					message: "You do not have access to this repository"
				});
			}

			const account = await findGithubAccountByUserId(req.user.id);

			if (!account) {
				return res.status(404).json({
					message: "GitHub account not found"
				});
			}

			if (!repository.url) {
				return res.status(400).json({
					message: "Repository URL is missing"
				});
			}

			const localPath = getRepositoryPath(repository.id);

			await cloneRepository({
				url: repository.url,
				path: localPath,
				accessToken: account.accessToken
			});

			await updateRepositoryPath(repository.id, localPath);

			res.status(201).json({
				message: "Repository cloned successfully",
				repositoryId: repository.id,
				localPath
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to clone repository"
			});
		}
	}
);

export default githubRouter;
