import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react';
import { CornerDownRight } from 'lucide-react';
import { memo, useLayoutEffect, useRef } from 'react';
import { getIcon } from '@/components/ui/iconMap';
import { getPattern } from '@/data/architecture';
import { getCategory, getComponentType } from '@/data/componentCatalog';
import type { ArchNode as ArchNodeType } from '@/domain/flowMapper';
import { useEditorStore } from '@/store/editorStore';

const DESC_LINE_HEIGHT = 14;

function NodeDescription({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const lines = Math.floor(el.clientHeight / DESC_LINE_HEIGHT);
      el.style.webkitLineClamp = String(Math.max(lines, 1));
      el.style.visibility = el.clientHeight < DESC_LINE_HEIGHT * 0.8 ? 'hidden' : 'visible';
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <p ref={ref} className="node-desc" title={text}>
      {text}
    </p>
  );
}

const HANDLES: [string, Position][] = [
  ['top', Position.Top],
  ['right', Position.Right],
  ['bottom', Position.Bottom],
  ['left', Position.Left],
];

function ArchNodeImpl({ id, data, selected }: NodeProps<ArchNodeType>) {
  const def = getComponentType(data.typeId);
  const cat = getCategory(def.category);
  const p = data.properties;
  const Icon = getIcon(def.icon);
  const pattern = p.patternId ? getPattern(p.patternId) : undefined;
  const boundary = def.shape === 'boundary';
  const minW = boundary ? 120 : 90;
  const minH = boundary ? 80 : 44;

  return (
    <div className={`arch-node shape-${def.shape} ${selected ? 'selected' : ''}`} style={{ ['--accent' as string]: cat.color }}>
      <NodeResizer
        isVisible={!!selected}
        minWidth={minW}
        minHeight={minH}
        onResizeStart={() => useEditorStore.getState().commit()}
        lineClassName="rs-line"
        handleClassName="rs-handle"
      />
      {HANDLES.map(([hid, pos]) => (
        <Handle key={hid} id={hid} type="source" position={pos} className="arch-handle" />
      ))}

      {def.shape === 'note' ? (
        <div className="note-body">
          <strong>{p.name}</strong>
          <p>{p.description || p.notes}</p>
        </div>
      ) : boundary ? (
        <div className="boundary-label">
          <Icon size={13} />
          <span>{p.name}</span>
          {pattern && <em className="tag">{pattern.short}</em>}
        </div>
      ) : (
        <>
          <div className="node-head">
            <Icon size={14} />
            <span className="node-type">{def.label}</span>
            {pattern && (
              <em className="tag" title={pattern.name}>
                {pattern.short}
              </em>
            )}
          </div>
          <div className="node-name" title={p.name}>
            {p.name}
          </div>
          {p.technology && <div className="node-tech">{p.technology}</div>}
          {p.description?.trim() && <NodeDescription text={p.description.trim()} />}
          {p.linkedDiagramId && (
            <span className="node-link" title="Possui diagrama de detalhe (duplo clique para abrir)">
              <CornerDownRight size={11} />
              detalhe
            </span>
          )}
        </>
      )}
      <span hidden>{id}</span>
    </div>
  );
}

export const ArchNode = memo(ArchNodeImpl);
