import { askCodebase } from "../services/ai/rag.service.js";
import { findRepositoryById } from "../repositories/repository.repository.js";

export const createChatMessage = async (req, res) => {
  try {
    const question = req.body.question || req.body.message;
    const repositoryId = Number(req.body.repositoryId);

    if (!question || !Number.isInteger(repositoryId)) {
      return res.status(400).json({
        message: "question (or message) and repositoryId are required"
      });
    }

    const repository = await findRepositoryById(repositoryId);
    if (!repository) {
      return res.status(404).json({
        message: "Repository not found"
      });
    }

    const result = await askCodebase(question, repositoryId);

    res.json({
      question,
      repositoryId,
      answer: result.answer,
      sources: result.sources
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Chat request failed",
      error: error.message
    });
  }
};

export const getChatMessage = async (req, res) => {
  try {
    const question = req.query.q || req.query.question;
    const repositoryId = Number(req.query.repositoryId);

    if (!question || !Number.isInteger(repositoryId)) {
      return res.status(400).json({
        message: "q (or question) and repositoryId query parameters are required"
      });
    }

    const repository = await findRepositoryById(repositoryId);
    if (!repository) {
      return res.status(404).json({
        message: "Repository not found"
      });
    }

    const result = await askCodebase(question, repositoryId);

    res.json({
      question,
      repositoryId,
      answer: result.answer,
      sources: result.sources
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Chat request failed",
      error: error.message
    });
  }
};
