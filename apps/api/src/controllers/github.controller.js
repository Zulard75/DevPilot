import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { repositories } from "../db/schema/repositories.js";
import {
  findGithubAccountByUserId,
  createGithubAccount
} from "../repositories/github-account.repository.js";
import { createRepository } from "../repositories/repository.repository.js";
import { getGithubRepositories } from "../services/github/repository.service.js";
import { ingestRepository } from "../services/github/ingestion.service.js";
import { getGithubRepositoryFiles } from "../services/github/file.service.js";
import { getGithubUser } from "../services/auth/auth.service.js";

export const connectGithub = async (req, res) => {
	try {
		const { accessToken } = req.body || {};

		if (!accessToken) {
			return res.status(400).json({
				message: "accessToken is required to connect GitHub"
			});
		}

		const githubUser = await getGithubUser(accessToken);

		const account = await createGithubAccount({
			userId: req.user.id,
			githubId: String(githubUser.id),
			accessToken
		});

		res.json({
			message: "GitHub account connected successfully",
			account: {
				id: account.id,
				githubId: account.githubId
			},
			githubUser: {
				id: githubUser.id,
				login: githubUser.login,
				name: githubUser.name,
				avatarUrl: githubUser.avatar_url
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Failed to connect GitHub account",
			error: error.message
		});
	}
};

export const getRepositories = async (req, res) => {
	try {
		const account = await findGithubAccountByUserId(req.user.id);

		if (!account) {
			return res.status(404).json({
				message: "GitHub account not found"
			});
		}

		const githubRepositories = await getGithubRepositories(
			account.accessToken
		);

		const savedRepositories = [];

		for (const githubRepository of githubRepositories) {
			const repository = await createRepository(
				req.user.id,
				githubRepository
			);

			savedRepositories.push(repository);
		}

		res.json({
			repositories: savedRepositories
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: "Failed to fetch and save repositories"
		});
	}
};

export const getGithubRepositoryFilesController = async (req, res) => {
	try {
		const account = await findGithubAccountByUserId(req.user.id);

		if (!account) {
			return res.status(404).json({
				message: "GitHub account not found"
			});
		}

		const repositoryId = Number(req.params.repositoryId);

		if (!Number.isInteger(repositoryId)) {
			return res.status(400).json({
				message: "Invalid repository ID"
			});
		}

		const [repository] = await db
			.select()
			.from(repositories)
			.where(eq(repositories.id, repositoryId))
			.limit(1);

		if (!repository) {
			return res.status(404).json({
				message: "Repository not found"
			});
		}

		if (repository.userId !== req.user.id) {
			return res.status(403).json({
				message: "You do not own this repository"
			});
		}

		const [owner] = repository.fullName.split("/");
		const tree = await getGithubRepositoryFiles(
			account.accessToken,
			owner,
			repository.name,
			repository.defaultBranch
		);

		res.json({
			repository,
			files: tree.tree ?? [],
			truncated: tree.truncated ?? false
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: "Failed to fetch repository files"
		});
	}
};

export const ingestGithubRepository = async (req, res) => {
	try {
		const account = await findGithubAccountByUserId(req.user.id);

		if (!account) {
			return res.status(404).json({
				message: "GitHub account not found"
			});
		}

		const repositoryId = Number(req.params.repositoryId);

		if (!Number.isInteger(repositoryId)) {
			return res.status(400).json({
				message: "Invalid repository ID"
			});
		}

		const [repository] = await db
			.select()
			.from(repositories)
			.where(eq(repositories.id, repositoryId))
			.limit(1);

		if (!repository) {
			return res.status(404).json({
				message: "Repository not found"
			});
		}

		if (repository.userId !== req.user.id) {
			return res.status(403).json({
				message: "You do not own this repository"
			});
		}

		const result = await ingestRepository({
			accessToken: account.accessToken,
			repository
		});

		res.json({
			message: "Repository ingested successfully",
			files: result
		});
	} catch (error) {
		console.error(error);

		res.status(500).json({
			message: "Repository ingestion failed"
		});
	}
};
