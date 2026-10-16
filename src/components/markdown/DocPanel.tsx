import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { useDocument } from '@/hooks/useDocument';
import type { DocumentScope } from '@/types';
import { ConflictBanner } from './DocPanel.styles';

interface Props {
  scope: DocumentScope;
  ownerId: string;
  compact?: boolean;
}

export function DocPanel({ scope, ownerId, compact }: Props) {
  const { content, setContent, status, retry, keepMine, useServer } = useDocument(scope, ownerId);
  if (content === null) return <div className="loading">Carregando documentação…</div>;

  return (
    <>
      {status === 'conflict' && (
        <ConflictBanner role="alert">
          <span>Este documento foi alterado em outra sessão. Seu texto continua aqui e ainda não foi salvo.</span>
          <button className="btn btn-sm" onClick={() => void useServer()}>
            Carregar a do servidor
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => void keepMine()}>
            Manter a minha
          </button>
        </ConflictBanner>
      )}
      {status === 'error' && (
        <ConflictBanner role="alert">
          <span>Não foi possível salvar. Suas alterações estão preservadas nesta tela.</span>
          <button className="btn btn-sm btn-primary" onClick={() => void retry()}>
            Tentar novamente
          </button>
        </ConflictBanner>
      )}
      <MarkdownEditor value={content} onChange={setContent} status={status} compact={compact} />
    </>
  );
}
