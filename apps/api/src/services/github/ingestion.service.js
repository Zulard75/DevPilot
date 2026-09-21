import {
  getGithubRepositoryFiles,
  getGithubFileContent
} from "./file.service.js";

import { createDocument } from "../../repositories/document.repository.js";
import { createChunk } from "../../repositories/chunk.repository.js";
import { createEmbedding } from "../../repositories/embedding.repository.js";

import { chunkText } from "../ai/chunk.service.js";
import { createEmbedding as generateEmbedding } from "../../ai/embeddings/huggingface.js";

const allowedExtensions = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".cpp",
  ".c",
  ".h",
  ".css",
  ".html",
  ".md",
  ".json",
  ".yml",
  ".yaml"
];

const shouldProcessFile = (path) => {
  if (path.includes("node_modules/") || path.includes(".git/")) {
    return false;
  }

  return allowedExtensions.some((extension) => path.endsWith(extension));
};

export const ingestRepository = async ({ accessToken, repository }) => {
  const [owner] = repository.fullName.split("/");

  const tree = await getGithubRepositoryFiles(
    accessToken,
    owner,
    repository.name,
    repository.defaultBranch
  );

  const files = (tree.tree ?? []).filter(
    (item) => item.type === "blob" && shouldProcessFile(item.path)
  );

  const result = [];

  for (const file of files) {
    try {
      const content = await getGithubFileContent(
        accessToken,
        owner,
        repository.name,
        file.path
      );

      if (!content) {
        continue;
      }

      const document = await createDocument(
        repository.id,
        file.path,
        content
      );

      const textChunks = chunkText(content);
      const documentChunks = [];

      for (let index = 0; index < textChunks.length; index++) {
        const chunk = await createChunk(
          document.id,
          textChunks[index],
          index
        );

        const embedding = await generateEmbedding(textChunks[index]);

        await createEmbedding(chunk.id, embedding);
        documentChunks.push(chunk.id);
      }

      result.push({
        path: file.path,
        documentId: document.id,
        chunks: documentChunks.length
      });
    } catch (error) {
      console.error(`Failed to process ${file.path}:`, error.message);
    }
  }

  return result;
};
