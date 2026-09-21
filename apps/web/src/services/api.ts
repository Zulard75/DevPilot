const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const githubLogin = () => {
  window.location.assign(`${API_BASE_URL}/auth/github`);
};

const request = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error((await response.json()).message ?? 'API request failed');
  }

  return response.json();
};

export const api = {
  health: async () => request('/health'),
  getGithubRepositories: async () => request('/github/repositories')
};
