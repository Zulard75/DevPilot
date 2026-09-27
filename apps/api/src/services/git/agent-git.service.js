import {
  createBranch,
  getDiff,
  stageAll,
  commitChanges,
  pushBranch
} from "./git.service.js";

export const prepareAgentBranch = async ({ repositoryPath, runId }) => {
  const branchName = `devpilot/agent-${runId}`;
  await createBranch(repositoryPath, branchName);
  return branchName;
};

export const getAgentDiff = async (repositoryPath) => {
  return getDiff(repositoryPath);
};

export const commitAgentChanges = async ({ repositoryPath, message }) => {
  await stageAll(repositoryPath);
  return commitChanges(repositoryPath, message);
};

export const pushAgentChanges = async ({ repositoryPath, branchName }) => {
  return pushBranch(repositoryPath, branchName);
};