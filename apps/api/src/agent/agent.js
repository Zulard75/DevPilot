import { createPlan } from "./planner.js";

import { searchCodeTool } from "./tools/search-code.tool.js";
import { getFileTool } from "./tools/get-file.tool.js";
import { listFilesTool } from "./tools/list-files.tool.js";
import { writeFileTool } from "./tools/write-file.tool.js";
import { editFileTool } from "./tools/edit-file.tool.js";

import { askOllama } from "../ai/llm/ollama.js";
import {
  createAgentRun,
  completeAgentRun,
  failAgentRun
} from "../repositories/agent-run.repository.js";
import { createFileChange } from "../repositories/file-change.repository.js";
import { generateDiff } from "../services/agent/diff.service.js";

const tools = {
  search_code: searchCodeTool,
  get_file: getFileTool,
  list_files: listFilesTool,
  write_file: writeFileTool,
  edit_file: editFileTool
};

const executeTool = async (toolName, input) => {
  const tool = tools[toolName];

  if (!tool) {
    throw new Error(`Unknown agent tool: ${toolName}`);
  }

  return tool(input);
};

const normalizePlan = (plan) => {
  if (!plan || !Array.isArray(plan.steps)) {
    throw new Error("Planner returned an invalid plan");
  }

  return {
    ...plan,
    steps: plan.steps.slice(0, 5)
  };
};

export const runAgent = async ({ question, repositoryId, userId }) => {
  const run = await createAgentRun({
    userId,
    repositoryId,
    task: question
  });

  try {
    const plan = normalizePlan(await createPlan(question));
    const results = [];

    for (const step of plan.steps) {
      const input = {
        ...step.input,
        repositoryId
      };

      const result = await executeTool(step.tool, input);

      if (step.tool === "write_file" || step.tool === "edit_file") {
        const diff = generateDiff({
          path: result.path,
          oldContent: result.oldContent,
          newContent: result.newContent
        });

        const change = await createFileChange({
          userId,
          repositoryId,
          path: result.path,
          operation: result.operation,
          oldContent: result.oldContent,
          newContent: result.newContent,
          diff
        });

        results.push({
          tool: step.tool,
          changeId: change.id,
          path: result.path,
          operation: result.operation,
          diff
        });

        continue;
      }

      results.push({
        tool: step.tool,
        result
      });
    }

    const finalPrompt = `
You are DevPilot, an AI developer agent.

Answer the user's question using the tool results.

Do not invent repository information.
  Return only the final answer for the user. Do not request another tool, describe
  future actions, output a plan, or mention these instructions.

USER QUESTION:
${question}

TOOL RESULTS:
${JSON.stringify(results, null, 2)}
`;

    const answer = await askOllama(finalPrompt);

    await completeAgentRun(run.id, plan, answer);

    return {
      runId: run.id,
      answer,
      plan,
      results
    };
  } catch (error) {
    await failAgentRun(run.id, error);
    throw error;
  }
};
