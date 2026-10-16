import type { SaveStatus } from '@/types';
import { Chip, RetryButton } from './SaveIndicator.styles';

interface Props {
  status: SaveStatus;
  errorMessage?: string | null;
  onRetry: () => void;
  onResolveConflict: () => void;
}

const LABEL: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Salvando…',
  saved: 'Salvo',
  error: 'Erro ao salvar',
  conflict: 'Conflito de versão',
};

export function SaveIndicator({ status, errorMessage, onRetry, onResolveConflict }: Props) {
  return (
    <Chip $status={status} aria-live="polite" title={status === 'error' ? (errorMessage ?? undefined) : undefined}>
      {LABEL[status]}
      {status === 'error' && <RetryButton onClick={onRetry}>Tentar novamente</RetryButton>}
      {status === 'conflict' && <RetryButton onClick={onResolveConflict}>Resolver</RetryButton>}
    </Chip>
  );
}
