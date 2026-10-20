const env = import.meta.env as Record<string, string | undefined>;

export const REPOS = {
  frontend: env.VITE_REPO_FRONTEND_URL ?? 'https://github.com/luispizzilopes/archdraw-frontend',
  backend: env.VITE_REPO_BACKEND_URL ?? 'https://github.com/luispizzilopes/archdraw-backend',
};
