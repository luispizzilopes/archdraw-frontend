import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Option, OptionList } from './ConflictDialog.styles';

interface Props {
  conflictRevision: number | null;
  baseRevision: number;
  onKeepMine: () => Promise<void>;
  onUseServer: () => Promise<void>;
  onSaveAsCopy: () => Promise<string | null>;
  onClose: () => void;
  onOpenCopy: (diagramId: string) => void;
}

export function ConflictDialog({ conflictRevision, baseRevision, onKeepMine, onUseServer, onSaveAsCopy, onClose, onOpenCopy }: Props) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>, done: string) => {
    setBusy(true);
    try {
      await fn();
      toast(done, 'success');
      onClose();
    } catch {
      toast('Não foi possível concluir. Tente novamente.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Este diagrama foi alterado em outra sessão" onClose={onClose} width={560}>
      <p className="muted">
        Você editou a revisão {baseRevision}, mas o servidor já está na revisão {conflictRevision ?? 'mais recente'}. Nada foi sobrescrito.
        Escolha como prosseguir:
      </p>
      <OptionList>
        <Option
          disabled={busy}
          onClick={() =>
            run(async () => {
              const copyId = await onSaveAsCopy();
              await onUseServer();
              if (copyId) onOpenCopy(copyId);
            }, 'Sua versão foi salva como um novo diagrama.')
          }
        >
          <strong>Salvar minha versão como cópia</strong>
          <span>Cria um novo diagrama com o que você fez e carrega a versão do servidor aqui. Recomendado.</span>
        </Option>
        <Option disabled={busy} onClick={() => run(onKeepMine, 'Sua versão foi salva.')}>
          <strong>Manter a minha versão</strong>
          <span>Sobrescreve as alterações feitas na outra sessão.</span>
        </Option>
        <Option disabled={busy} onClick={() => run(onUseServer, 'Versão do servidor carregada.')}>
          <strong>Usar a versão do servidor</strong>
          <span>Descarta as alterações locais ainda não salvas (ficam guardadas como rascunho neste navegador).</span>
        </Option>
      </OptionList>
    </Modal>
  );
}
