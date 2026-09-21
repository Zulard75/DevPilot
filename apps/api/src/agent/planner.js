import { askOllama } from "../ai/llm/ollama.js";

export const createPlan = async (question) => {
  const prompt = `
You are an AI coding agent.

Create a short plan to answer the user's question.

Available tools:

1. search_code
2. get_file
3. list_files
4. write_file
5. edit_file

Return only JSON.

Use no more than 5 steps. Start with search_code for questions about implementation.
Only use get_file, write_file, or edit_file with a path returned by search_code or list_files.
Each step must use one of the available tools and its required input fields.

Format:

{
  "steps": [
    {
      "tool": "search_code",
      "input": {
        "query": "..."
      }
    },
    {
      "tool": "edit_file",
      "input": {
        "path": "src/app.js",
        "oldText": "old code",
        "newText": "new code"
      }
    }
  ]
}

User question:

${question}
`;

  const response = await askOllama(prompt);
  const jsonStart = response.indexOf("{");
  const jsonEnd = response.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd < jsonStart) {
    throw new Error("Planner returned invalid JSON");
  }

  return JSON.parse(response.slice(jsonStart, jsonEnd + 1));
};
