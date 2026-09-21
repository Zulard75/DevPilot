import { getFileTool } from "./get-file.tool.js";

export const editFileTool = async ({
  repositoryId,
  path,
  oldText,
  newText
}) => {
  if (!path) {
    throw new Error("File path is required");
  }

  if (!oldText) {
    throw new Error("oldText is required");
  }

  if (typeof newText !== "string") {
    throw new Error("newText must be a string");
  }

  const file = await getFileTool({
    repositoryId,
    path
  });

  if (!file) {
    throw new Error(`File not found: ${path}`);
  }

  if (!file.content.includes(oldText)) {
    throw new Error(`Text to replace was not found in ${path}`);
  }

  return {
    path,
    operation: "update",
    oldContent: file.content,
    newContent: file.content.replace(oldText, newText)
  };
};
