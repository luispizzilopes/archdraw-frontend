import { Bold, Code, Code2, Heading1, Heading2, Italic, Link as LinkIcon, List, ListChecks, Plus, Table } from 'lucide-react';
import { useRef, useState } from 'react';
import { DOC_SNIPPETS } from '@/domain/docTemplates';
import type { SaveStatus } from '@/types';
import { Menu } from '@/components/ui/Menu';
import { MarkdownPreview } from './MarkdownPreview';

type Mode = 'edit' | 'split' | 'preview';

interface Props {
  value: string;
  onChange: (v: string) => void;
  status: SaveStatus;
  compact?: boolean;
}

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Salvando…',
  saved: 'Salvo',
  error: 'Erro ao salvar',
  conflict: 'Conflito de versão',
};

export function MarkdownEditor({ value, onChange, status, compact }: Props) {
  const [mode, setMode] = useState<Mode>('split');
  const ref = useRef<HTMLTextAreaElement>(null);
  const effective: Mode = compact && mode === 'split' ? 'edit' : mode;

  const apply = (fn: (sel: string, before: string, after: string) => { text: string; select?: [number, number] }) => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const r = fn(value.slice(s, e), value.slice(0, s), value.slice(e));
    onChange(value.slice(0, s) + r.text + value.slice(e));
    requestAnimationFrame(() => {
      ta.focus();
      const [a, b] = r.select ?? [s + r.text.length, s + r.text.length];
      ta.setSelectionRange(s + a, s + b);
    });
  };

  const wrap = (mark: string, placeholder: string) =>
    apply((sel) => {
      const inner = sel || placeholder;
      return { text: `${mark}${inner}${mark}`, select: [mark.length, mark.length + inner.length] };
    });

  const linePrefix = (prefix: string) =>
    apply((sel, before) => {
      const atStart = before.length === 0 || before.endsWith('\n');
      const body = (sel || 'texto')
        .split('\n')
        .map((l) => prefix + l)
        .join('\n');
      return { text: (atStart ? '' : '\n') + body };
    });

  const insert = (text: string) => apply(() => ({ text }));

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      wrap('**', 'negrito');
    }
    if (mod && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      wrap('*', 'itálico');
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      insert('  ');
    }
  };

  const tools = [
    { icon: Heading1, title: 'Título', run: () => linePrefix('# ') },
    { icon: Heading2, title: 'Subtítulo', run: () => linePrefix('## ') },
    { icon: Bold, title: 'Negrito (Ctrl+B)', run: () => wrap('**', 'negrito') },
    { icon: Italic, title: 'Itálico (Ctrl+I)', run: () => wrap('*', 'itálico') },
    { icon: Code, title: 'Código inline', run: () => wrap('`', 'código') },
    { icon: Code2, title: 'Bloco de código', run: () => insert('\n```ts\n\n```\n') },
    { icon: List, title: 'Lista', run: () => linePrefix('- ') },
    { icon: ListChecks, title: 'Checklist', run: () => linePrefix('- [ ] ') },
    { icon: Table, title: 'Tabela', run: () => insert('\n| Coluna A | Coluna B |\n| --- | --- |\n|  |  |\n') },
    { icon: LinkIcon, title: 'Link', run: () => apply((sel) => ({ text: `[${sel || 'texto'}](https://)` })) },
  ];

  return (
    <div className="md-editor">
      <div className="md-toolbar">
        <div className="md-tools">
          {tools.map(({ icon: Icon, title, run }) => (
            <button key={title} className="icon-btn" title={title} aria-label={title} onClick={run} disabled={effective === 'preview'}>
              <Icon size={15} />
            </button>
          ))}
          <Menu
            align="left"
            items={DOC_SNIPPETS.map((s) => ({ label: s.label, onClick: () => insert(s.body) }))}
            trigger={({ toggle }) => (
              <button className="btn btn-ghost btn-sm" onClick={toggle} disabled={effective === 'preview'}>
                <Plus size={13} /> Seção
              </button>
            )}
          />
        </div>
        <div className="md-right">
          <span className={`save-status ${status}`}>{STATUS_LABEL[status]}</span>
          <div className="segmented">
            {(['edit', ...(compact ? [] : ['split']), 'preview'] as Mode[]).map((m) => (
              <button key={m} className={effective === m ? 'on' : ''} onClick={() => setMode(m)}>
                {m === 'edit' ? 'Editar' : m === 'split' ? 'Dividido' : 'Visualizar'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`md-panes md-${effective}`}>
        {effective !== 'preview' && (
          <textarea
            ref={ref}
            className="md-input"
            value={value}
            spellCheck={false}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escreva em Markdown…"
          />
        )}
        {effective !== 'edit' && (
          <div className="md-preview">
            <MarkdownPreview source={value} />
          </div>
        )}
      </div>
    </div>
  );
}
