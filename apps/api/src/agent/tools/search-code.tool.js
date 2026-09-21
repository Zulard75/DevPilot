import { searchCode } from "../../services/ai/search.service.js";

export const searchCodeTool = async ({ query, repositoryId }) => {
  return searchCode(query, repositoryId, 5);
};
