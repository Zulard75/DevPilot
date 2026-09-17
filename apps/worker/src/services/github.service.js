import crypto from "crypto";

const generateGithubState = () => {
  return crypto.randomBytes(32).toString("hex");
};

const getGithubAuthUrl = (state) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: "read:user user:email repo",
    state
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

const exchangeCodeForToken = async (code) => {
  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL
      })
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error_description || "GitHub token exchange failed"
    );
  }

  return data;
};

const getGithubUser = async (accessToken) => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
};

export {
  generateGithubState,
  getGithubAuthUrl,
  exchangeCodeForToken,
  getGithubUser
};