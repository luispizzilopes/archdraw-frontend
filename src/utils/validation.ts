export const validateEmail = (v: string): string | null =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Informe um e-mail válido.';

export const validatePassword = (v: string): string | null => {
  if (v.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (!/[A-Z]/.test(v)) return 'A senha deve conter ao menos uma letra maiúscula.';
  if (!/[a-z]/.test(v)) return 'A senha deve conter ao menos uma letra minúscula.';
  if (!/[0-9]/.test(v)) return 'A senha deve conter ao menos um número.';
  return null;
};
