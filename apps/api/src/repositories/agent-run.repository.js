import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { agentRuns } from "../db/schema/agent-runs.js";

export const createAgentRun = async ({ userId, repositoryId, task }) => {
  const [run] = await db
    .insert(agentRuns)
    .values({
      userId,
      repositoryId,
      task,
      status: "running"
    })
    .returning();

  return run;
};

export const completeAgentRun = async (runId, plan, result) => {
  const [run] = await db
    .update(agentRuns)
    .set({
      status: "completed",
      plan: JSON.stringify(plan),
      result,
      completedAt: new Date()
    })
    .where(eq(agentRuns.id, runId))
    .returning();

  return run;
};

export const failAgentRun = async (runId, error) => {
  const [run] = await db
    .update(agentRuns)
    .set({
      status: "failed",
      error: error.message,
      completedAt: new Date()
    })
    .where(eq(agentRuns.id, runId))
    .returning();

  return run;
};
