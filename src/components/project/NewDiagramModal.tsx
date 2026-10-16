import { useState } from 'react';
import { Field } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getTemplate } from '@/domain/templates';
import { TemplatePicker } from './TemplatePicker';

interface Props {
  onSubmit: (v: { name: string; templateId: string }) => void | Promise<void>;
  onClose: () => void;
  initialName?: string;
  initialTemplate?: string;
}

export function NewDiagramModal({ onSubmit, onClose, initialName = '', initialTemplate = 'blank' }: Props) {
  const [templateId, setTemplateId] = useState(initialTemplate);
  const [name, setName] = useState(initialName);
  const [touched, setTouched] = useState(!!initialName);
  const effective = touched ? name : initialName || (templateId === 'blank' ? '' : getTemplate(templateId).name);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const valid = effective.trim().length > 0;

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    try {
      await onSubmit({ name: effective, templateId });
      onClose();
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Novo diagrama"
      width={720}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={!valid || busy} onClick={submit}>
            Criar diagrama
          </button>
        </>
      }
    >
      <div className="form">
        <Field label="Nome">
          <input
            className="input"
            autoFocus
            value={effective}
            placeholder="ex.: Visão geral"
            onChange={(e) => {
              setName(e.target.value);
              setTouched(true);
            }}
            onKeyDown={(e) => e.key === 'Enter' && void submit()}
          />
        </Field>
        <TemplatePicker value={templateId} onChange={setTemplateId} />
      </div>
    </Modal>
  );
}
