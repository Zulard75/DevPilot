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
  try {
    const embedding = await createEmbedding(
      "GitHub authentication using OAuth"
    );

    const [storedEmbedding] = await db.insert(embeddings).values({
      text: "GitHub authentication using OAuth",
      embedding
    }).returning({
      id: embeddings.id,
      text: embeddings.text,
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