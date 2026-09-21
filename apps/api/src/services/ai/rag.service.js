import { searchCode } from "./search.service.js";
import { askOllama } from "../../ai/llm/ollama.js";

export const askCodebase = async (question, repositoryId) => {
  const results = await searchCode(question, repositoryId, 5);

  if (!results.length) {
    return {
      answer: "I could not find relevant code in the repository.",
      sources: []
    };
  }

  const context = results
    .map(
      (result, index) => `
SOURCE ${index + 1}
FILE: ${result.path}

${result.content}
`
    )
    .join("\n");

  const prompt = `
You are DevPilot, an AI developer assistant.

Answer the user's question using the provided repository context.

Rules:
- Use the repository context as the primary source.
- Do not invent code that is not present in the context.
- Explain which files are relevant.
- If the context is insufficient, clearly say so.

REPOSITORY CONTEXT:

${context}

USER QUESTION:

${question}
`;

  const answer = await askOllama(prompt);

  return {
    answer,
    sources: results.map((result) => ({
      path: result.path,
      similarity: result.similarity
    }))
  };
};
