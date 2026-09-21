import simpleGit from "simple-git";

export const createGit = (repositoryPath) => simpleGit(repositoryPath);

export const createBranch = async (repositoryPath, branchName) => {
  const git = createGit(repositoryPath);
  await git.checkoutLocalBranch(branchName);
  return branchName;
};

export const getDiff = async (repositoryPath) => {
  const git = createGit(repositoryPath);
  return git.diff();
};

export const stageAll = async (repositoryPath) => {
  const git = createGit(repositoryPath);
  await git.add(".");
};

export const commitChanges = async (repositoryPath, message) => {
  const git = createGit(repositoryPath);
  return git.commit(message);
};

export const getCurrentBranch = async (repositoryPath) => {
  const git = createGit(repositoryPath);
  const result = await git.branchLocal();
  return result.current;
};