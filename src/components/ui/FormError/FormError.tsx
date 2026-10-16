import { Box } from './FormError.styles';

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <Box role="alert">{message}</Box>;
}
