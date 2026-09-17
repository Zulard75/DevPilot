import crypto from "crypto";
import { env } from "../../config/env.js";

export const generateGithubState = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const getGithubAuthUrl = (state) => {
  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubCallbackUrl,
    scope: "read:user user:email repo",
    state
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

export const exchangeCodeForToken = async (code) => {
  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: env.githubClientId,
        client_secret: env.githubClientSecret,
        code,
        redirect_uri: env.githubCallbackUrl
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

export const getGithubUser = async (accessToken) => {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2026-03-10"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
};