import {
  listDocumentsByRepository,
  listAllDocuments,
  findDocumentById
} from "../repositories/document.repository.js";

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