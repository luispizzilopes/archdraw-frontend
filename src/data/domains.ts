export const domains = {
  api: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5080',
};
