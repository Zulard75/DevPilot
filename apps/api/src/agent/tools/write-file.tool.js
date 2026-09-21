import { getFileTool } from "./get-file.tool.js";

export const writeFileTool = async ({ repositoryId, path, content }) => {
  if (!path) {
    throw new Error("File path is required");
  }

  if (typeof content !== "string") {
    throw new Error("File content must be a string");
  }

  const existingFile = await getFileTool({
    repositoryId,
    path
  });

  return {
    path,
    operation: existingFile ? "update" : "create",
    oldContent: existingFile ? existingFile.content : null,
    newContent: content
  };
};
