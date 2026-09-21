export const getGithubRepositoryFiles = async (
  accessToken,
  owner,
  repo,
  branch
) => {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repository files");
  }

  return response.json();
};

export const getGithubFileContent = async (
  accessToken,
  owner,
  repo,
  path
) => {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${path}`);
  }

  const data = await response.json();

  if (!data.content) {
    return null;
  }

  return Buffer.from(data.content, "base64").toString("utf-8");
};
