const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const api = {
  health: async () => fetch(`${API_BASE_URL}/health`).then((response) => response.json())
};
