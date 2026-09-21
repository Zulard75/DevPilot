import path from "path";

export const getRepositoryPath = (repositoryId) => {
  return path.resolve("workspace", `repository-${repositoryId}`);
};