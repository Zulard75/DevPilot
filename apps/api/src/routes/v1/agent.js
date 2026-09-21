import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth.js";
import { db } from "../../db/index.js";
import { agentRuns } from "../../db/schema/agent-runs.js";
import { runAgent } from "../../agent/agent.js";
import { findRepositoryByUser } from "../../repositories/repository.repository.js";
import {
	findFileChangeById,
	updateFileChangeStatus
} from "../../repositories/file-change.repository.js";
import { applyChange } from "../../services/agent/apply-change.service.js";
import {
	prepareAgentBranch,
	getAgentDiff,
	commitAgentChanges
} from "../../services/git/agent-git.service.js";

export const agentRouter = Router();

agentRouter.post(
	"/run",
	requireAuth,
	async (req, res) => {
		try {
			const { question, repositoryId } = req.body;
			const parsedRepositoryId = Number(repositoryId);

			if (!question || !Number.isInteger(parsedRepositoryId)) {
				return res.status(400).json({
					message: "question and repositoryId are required"
				});
			}

			const repository = await findRepositoryByUser(
				parsedRepositoryId,
				req.user.id
			);

			if (!repository) {
				return res.status(403).json({
					message: "You do not have access to this repository"
				});
			}

			const result = await runAgent({
				question,
				repositoryId: parsedRepositoryId,
				userId: req.user.id
			});

			res.json(result);
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Agent execution failed"
			});
		}
	}
);

agentRouter.get(
	"/runs",
	requireAuth,
	async (req, res) => {
		try {
			const runs = await db
				.select()
				.from(agentRuns)
				.where(eq(agentRuns.userId, req.user.id))
				.orderBy(desc(agentRuns.createdAt));

			res.json({
				runs
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to fetch agent runs"
			});
		}
	}
);

agentRouter.get(
	"/changes/:changeId",
	requireAuth,
	async (req, res) => {
		try {
			const changeId = Number(req.params.changeId);
			const change = await findFileChangeById(changeId, req.user.id);

			if (!change) {
				return res.status(404).json({
					message: "Change not found"
				});
			}

			res.json({
				change
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to fetch change"
			});
		}
	}
);

agentRouter.post(
	"/changes/:changeId/approve",
	requireAuth,
	async (req, res) => {
		try {
			const changeId = Number(req.params.changeId);
			const change = await findFileChangeById(changeId, req.user.id);

			if (!change) {
				return res.status(404).json({
					message: "Change not found"
				});
			}

			if (change.status !== "pending") {
				return res.status(400).json({
					message: "Change is not pending"
				});
			}

			const updated = await updateFileChangeStatus(
				changeId,
				req.user.id,
				"approved"
			);

			res.json({
				message: "Change approved",
				change: updated
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to approve change"
			});
		}
	}
);

agentRouter.post(
	"/changes/:changeId/reject",
	requireAuth,
	async (req, res) => {
		try {
			const changeId = Number(req.params.changeId);
			const change = await findFileChangeById(changeId, req.user.id);

			if (!change) {
				return res.status(404).json({
					message: "Change not found"
				});
			}

			if (change.status !== "pending") {
				return res.status(400).json({
					message: "Change is not pending"
				});
			}

			const updated = await updateFileChangeStatus(
				changeId,
				req.user.id,
				"rejected"
			);

			res.json({
				message: "Change rejected",
				change: updated
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to reject change"
			});
		}
	}
 );

agentRouter.post(
	"/changes/:changeId/apply",
	requireAuth,
	async (req, res) => {
		try {
			const changeId = Number(req.params.changeId);
			const change = await findFileChangeById(changeId, req.user.id);

			if (!change) {
				return res.status(404).json({
					message: "Change not found"
				});
			}

			if (change.status !== "approved") {
				return res.status(400).json({
					message: "Only approved changes can be applied"
				});
			}

			const repository = await findRepositoryByUser(
				change.repositoryId,
				req.user.id
			);

			if (!repository?.localPath) {
				return res.status(400).json({
					message: "Repository is not cloned"
				});
			}

			const result = await applyChange(change, repository.localPath);
			const updated = await updateFileChangeStatus(
				changeId,
				req.user.id,
				"applied"
			);

			res.json({
				message: "Change applied successfully",
				document: result,
				change: updated
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to apply change"
			});
		}
	}
);

agentRouter.post(
	"/runs/:runId/branch",
	requireAuth,
	async (req, res) => {
		try {
			const runId = Number(req.params.runId);
			const [run] = await db
				.select()
				.from(agentRuns)
				.where(
					and(
						eq(agentRuns.id, runId),
						eq(agentRuns.userId, req.user.id)
					)
				)
				.limit(1);

			if (!run) {
				return res.status(404).json({
					message: "Agent run not found"
				});
			}

			const repository = await findRepositoryByUser(
				run.repositoryId,
				req.user.id
			);

			if (!repository) {
				return res.status(403).json({
					message: "You do not have access to this repository"
				});
			}

			if (!repository.localPath) {
				return res.status(400).json({
					message: "Repository is not cloned"
				});
			}

			const branch = await prepareAgentBranch({
				repositoryPath: repository.localPath,
				runId
			});

			res.json({
				message: "Agent branch created",
				branch
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to create agent branch"
			});
		}
	}
);

agentRouter.get(
	"/runs/:runId/git-diff",
	requireAuth,
	async (req, res) => {
		try {
			const runId = Number(req.params.runId);
			const [run] = await db
				.select()
				.from(agentRuns)
				.where(
					and(
						eq(agentRuns.id, runId),
						eq(agentRuns.userId, req.user.id)
					)
				)
				.limit(1);

			if (!run) {
				return res.status(404).json({
					message: "Agent run not found"
				});
			}

			const repository = await findRepositoryByUser(
				run.repositoryId,
				req.user.id
			);

			if (!repository?.localPath) {
				return res.status(400).json({
					message: "Repository is not cloned"
				});
			}

			const diff = await getAgentDiff(repository.localPath);

			res.json({
				diff
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to generate Git diff"
			});
		}
	}
);

agentRouter.post(
	"/runs/:runId/commit",
	requireAuth,
	async (req, res) => {
		try {
			const runId = Number(req.params.runId);
			const message = req.body.message || "Apply DevPilot agent changes";
			const [run] = await db
				.select()
				.from(agentRuns)
				.where(
					and(
						eq(agentRuns.id, runId),
						eq(agentRuns.userId, req.user.id)
					)
				)
				.limit(1);

			if (!run) {
				return res.status(404).json({
					message: "Agent run not found"
				});
			}

			const repository = await findRepositoryByUser(
				run.repositoryId,
				req.user.id
			);

			if (!repository?.localPath) {
				return res.status(400).json({
					message: "Repository is not cloned"
				});
			}

			const result = await commitAgentChanges({
				repositoryPath: repository.localPath,
				message
			});

			res.json({
				message: "Changes committed successfully",
				commit: result
			});
		} catch (error) {
			console.error(error);

			res.status(500).json({
				message: "Failed to commit changes"
			});
		}
	}
);
