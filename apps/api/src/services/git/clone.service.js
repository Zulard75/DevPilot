import fs from "fs/promises";
import simpleGit from "simple-git";

export const cloneRepository = async ({ url, path, accessToken }) => {
  await fs.mkdir(path, { recursive: true });

  const authenticatedUrl = url.replace(
    "https://github.com/",
    `https://x-access-token:${encodeURIComponent(accessToken)}@github.com/`
  );

  await simpleGit()
    .env("GIT_TERMINAL_PROMPT", "0")
    .clone(authenticatedUrl, path);

  return path;
};