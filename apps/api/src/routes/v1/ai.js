import express from "express";
import { askOllama } from "../../ai/llm/ollama.js";
import { createEmbedding } from "../../ai/embeddings/huggingface.js";
import { db, embeddings } from "../../db/index.js";
import { searchCode } from "../../services/ai/search.service.js";
import { askCodebase } from "../../services/ai/rag.service.js";
import { requireAuth } from "../../middleware/auth.js";
import { findRepositoryByUser } from "../../repositories/repository.repository.js";

export const aiRouter = express.Router();

aiRouter.get("/test", async (req, res) => {
  try {
    const answer = await askOllama(
      "Explain Node.js in simple words."
    );

    res.json({
      answer
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "AI request failed"
    });
  }
});

aiRouter.get("/embedding-test", async (req, res) => {
  const chunkId = Number(req.query.chunkId);

  if (!Number.isInteger(chunkId) || chunkId < 1) {
    return res.status(400).json({
      message: "chunkId query parameter is required to store an embedding"
    });
  }

  try {
    const embedding = await createEmbedding(
      "GitHub authentication using OAuth"
    );

    const [storedEmbedding] = await db.insert(embeddings).values({
      chunkId,
      embedding
    }).returning({
      id: embeddings.id,
      chunkId: embeddings.chunkId,
      createdAt: embeddings.createdAt
    });

    res.json({
      embedding,
      stored: storedEmbedding
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Embedding generation failed"
    });
  }
});

aiRouter.get("/search", requireAuth, async (req, res) => {
  try {
    const query = req.query.q;
    const repositoryId = Number(req.query.repositoryId);

    if (!query || !Number.isInteger(repositoryId)) {
      return res.status(400).json({
        message: "Query and repositoryId are required"
      });
    }

    const repository = await findRepositoryByUser(
      repositoryId,
      req.user.id
    );

    if (!repository) {
      return res.status(403).json({
        message: "You do not have access to this repository"
      });
    }

    const results = await searchCode(query, repository.id);

    res.json({
      query,
      results
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Semantic search failed"
    });
  }
});

aiRouter.get("/chat", requireAuth, async (req, res) => {
  try {
    const question = req.query.q;
    const repositoryId = Number(req.query.repositoryId);

    if (!question || !Number.isInteger(repositoryId)) {
      return res.status(400).json({
        message: "Question and repositoryId are required"
      });
    }

    const repository = await findRepositoryByUser(
      repositoryId,
      req.user.id
    );

    if (!repository) {
      return res.status(403).json({
        message: "You do not have access to this repository"
      });
    }

    const result = await askCodebase(question, repository.id);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "RAG request failed"
    });
  }
});

export default aiRouter;