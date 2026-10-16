import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export function NameModal({
  title,
  initial,
  onSubmit,
  onClose,
}: {
  title: string;
  initial: string;
  onSubmit: (n: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const [v, setV] = useState(initial);
  const toast = useToast();
  const submit = async () => {
    if (!v.trim()) return;
    try {
      await onSubmit(v.trim());
      onClose();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };
  return (
    <Modal
      title={title}
      onClose={onClose}
      width={420}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={() => void submit()} disabled={!v.trim()}>
            Salvar
          </button>
        </>
      }
    >
      <input
        className="input"
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && void submit()}
        onFocus={(e) => e.target.select()}
      />
    </Modal>
  );
}
