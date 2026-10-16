import { Modal } from '@/components/ui/Modal';
import { formatDateTime } from '@/utils/format';

interface Props {
  savedAt: string;
  stale: boolean;
  onRecover: () => void;
  onSaveAsCopy: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryDialog({ savedAt, stale, onRecover, onSaveAsCopy, onDiscard }: Props) {
  return (
    <Modal
      title="Alterações não sincronizadas"
      onClose={onDiscard}
      footer={
        <>
          <button className="btn" onClick={onDiscard}>
            Descartar rascunho
          </button>
          {stale ? (
            <button className="btn btn-primary" onClick={onSaveAsCopy}>
              Salvar como cópia
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onRecover}>
              Recuperar alterações
            </button>
          )}
        </>
      }
    >
      <p>Encontramos um rascunho deste diagrama de {formatDateTime(savedAt)} que não chegou a ser salvo no servidor.</p>
      {stale && (
        <p className="muted">
          O diagrama foi alterado desde então, por isso o rascunho não será aplicado sobre ele. Você pode guardá-lo como um novo diagrama.
        </p>
      )}
    </Modal>
  );
}
