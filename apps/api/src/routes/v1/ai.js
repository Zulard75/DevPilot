import express from "express";
import { askOllama } from "../../ai/llm/ollama.js";
import { createEmbedding } from "../../ai/embeddings/huggingface.js";
import { db, embeddings } from "../../db/index.js";

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

export default aiRouter;