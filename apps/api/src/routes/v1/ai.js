import express from "express";
import { askOllama } from "../../ai/llm/ollama.js";
import { createEmbedding } from "../../ai/embeddings/huggingface.js";

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

    res.json({
      embedding
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Embedding generation failed"
    });
  }
});

export default aiRouter;