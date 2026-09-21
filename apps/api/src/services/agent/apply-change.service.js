import fs from "fs/promises";
import path from "path";

import {
  findDocument,
  createDocument,
  updateDocument
} from "../../repositories/document.repository.js";

const getSafeFilePath = (repositoryPath, filePath) => {
  const root = path.resolve(repositoryPath);
  const resolved = path.resolve(root, filePath);

  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("File path is outside the repository");
  }

  return resolved;
};

export const applyChange = async (change, repositoryPath) => {
  if (!repositoryPath) {
    throw new Error("Repository is not cloned");
  }

  const filePath = getSafeFilePath(repositoryPath, change.path);

  if (change.operation === "create") {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, change.newContent, "utf8");

    return createDocument(
      change.repositoryId,
      change.path,
      change.newContent
    );
  }

  if (change.operation === "update") {
    const document = await findDocument(
      change.repositoryId,
      change.path
    );

    if (!document) {
      throw new Error(`Document not found: ${change.path}`);
    }

    await fs.writeFile(filePath, change.newContent, "utf8");

    return updateDocument(document.id, change.newContent);
  }

  if (change.operation === "delete") {
    throw new Error("Delete operation is not implemented yet");
  }

  throw new Error(`Unsupported operation: ${change.operation}`);
};