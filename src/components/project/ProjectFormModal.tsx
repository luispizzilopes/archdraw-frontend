import { useState } from 'react';
import { ArchitecturePicker } from '@/components/ui/ArchitecturePicker';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { Project } from '@/types';

interface Props {
  project?: Project;
  onSubmit: (v: { name: string; description: string; primaryStyleId?: string; secondaryStyleIds: string[] }) => void | Promise<void>;
  onClose: () => void;
}

export function ProjectFormModal({ project, onSubmit, onClose }: Props) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [styles, setStyles] = useState<string[]>(
    project ? ([project.primaryStyleId, ...project.secondaryStyleIds].filter(Boolean) as string[]) : [],
  );
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const valid = name.trim().length > 0;

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    try {
      await onSubmit({ name, description, primaryStyleId: styles[0], secondaryStyleIds: styles.slice(1) });
      onClose();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={project ? 'Editar projeto' : 'Novo projeto'}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={!valid || busy} onClick={submit}>
            {project ? 'Salvar' : 'Criar projeto'}
          </button>
        </>
      }
    >
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Field label="Nome">
          <input
            className="input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex.: Plataforma de E-commerce"
          />
        </Field>
        <Field label="Descrição">
          <textarea
            className="input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qual sistema este projeto representa?"
          />
        </Field>
        <ArchitecturePicker styleIds={styles} onStyles={setStyles} showPrimaryHint />
      </form>
    </Modal>
  );
}
