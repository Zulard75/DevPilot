import {
  listDocumentsByRepository,
  listAllDocuments,
  findDocumentById,
  createDocument
} from "../repositories/document.repository.js";
import { createChunk } from "../repositories/chunk.repository.js";
import { createEmbedding as saveEmbedding } from "../repositories/embedding.repository.js";
import { chunkText } from "../services/ai/chunk.service.js";
import { createEmbedding as generateEmbedding } from "../ai/embeddings/huggingface.js";

export const listDocuments = async (req, res) => {
  try {
    const repositoryId = req.query.repositoryId ? Number(req.query.repositoryId) : null;
    let documents = repositoryId
      ? await listDocumentsByRepository(repositoryId)
      : await listAllDocuments();

    if (repositoryId && (!documents || documents.length === 0)) {
      documents = await listAllDocuments();
    }

    res.json({ documents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to list documents" });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const documentId = Number(req.params.id);

    if (!Number.isInteger(documentId)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }

    const document = await findDocumentById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json({ document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch document" });
  }
};

export const createDocumentController = async (req, res) => {
  try {
    const { repositoryId, path, content } = req.body || {};

    if (!repositoryId || !path || typeof content !== "string") {
      return res.status(400).json({
        message: "repositoryId, path, and content are required"
      });
    }

    const document = await createDocument(Number(repositoryId), path, content);

    // Auto chunk and generate embeddings
    const textChunks = chunkText(content);
    const documentChunks = [];

    for (let index = 0; index < textChunks.length; index++) {
      try {
        const chunk = await createChunk(document.id, textChunks[index], index);
        const embedding = await generateEmbedding(textChunks[index]);
        await saveEmbedding(chunk.id, embedding);
        documentChunks.push(chunk.id);
      } catch (err) {
        console.warn(`Failed to embed chunk ${index} for ${path}:`, err.message);
      }
    }

    res.status(201).json({
      message: "Document created and indexed successfully",
      document,
      chunksIndexed: documentChunks.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create document",
      error: error.message
    });
  }
};