import { useReactFlow } from '@xyflow/react';
import { ArrowLeftRight, BookmarkPlus, ExternalLink, FilePlus2, Link2, Link2Off, Plus, Trash2, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { ArchitecturePicker } from '@/components/ui/ArchitecturePicker';
import { Field } from '@/components/ui/Field';
import { getIcon } from '@/components/ui/iconMap';
import { ARCHITECTURAL_PATTERNS } from '@/data/architecture';
import { CATEGORIES, COMPONENT_TYPES, getCategory, getComponentType } from '@/data/componentCatalog';
import { CONNECTION_KINDS, getConnectionKind } from '@/data/connectionCatalog';
import { LEVELS } from '@/domain/templates';
import { useEditorStore } from '@/store/editorStore';
import type { DiagramSummary, EdgeDirection, EdgeSync } from '@/types';
import { SharedBanner } from './PropertiesPanel.styles';

interface Props {
  siblings: Pick<DiagramSummary, 'id' | 'name'>[];
  parents: Pick<DiagramSummary, 'id' | 'name'>[];
  onOpenDiagram: (id: string) => void;
  onCreateLinked: (nodeId: string) => void;
  onSaveReusable: (nodeId: string) => void;
  onComponentEdited: (nodeId: string) => void;
}

export function PropertiesPanel(props: Props) {
  const nodeIds = useEditorStore(useShallow((s) => s.nodes.filter((n) => n.selected).map((n) => n.id)));
  const edgeIds = useEditorStore(useShallow((s) => s.edges.filter((e) => e.selected).map((e) => e.id)));

  return (
    <aside className="props">
      <div className="panel-title">Propriedades</div>
      <div className="props-scroll">
        {nodeIds.length === 1 && edgeIds.length === 0 ? (
          <NodeProps id={nodeIds[0]} {...props} />
        ) : edgeIds.length === 1 && nodeIds.length === 0 ? (
          <EdgeProps id={edgeIds[0]} />
        ) : nodeIds.length + edgeIds.length > 1 ? (
          <MultiProps nodes={nodeIds.length} edges={edgeIds.length} />
        ) : (
          <DiagramProps parents={props.parents} onOpenDiagram={props.onOpenDiagram} />
        )}
      </div>
    </aside>
  );
}

function DiagramProps({ parents, onOpenDiagram }: Pick<Props, 'parents' | 'onOpenDiagram'>) {
  const meta = useEditorStore((s) => s.meta);
  const settings = useEditorStore((s) => s.settings);
  const setMeta = useEditorStore((s) => s.setMeta);
  const setSettings = useEditorStore((s) => s.setSettings);
  const count = useEditorStore((s) => `${s.nodes.length} componentes · ${s.edges.length} conexões`);
  if (!meta) return null;
  return (
    <div className="props-form">
      <div className="props-kicker">Diagrama</div>
      <Field label="Nome">
        <input className="input" value={meta.name} onChange={(e) => setMeta({ name: e.target.value })} />
      </Field>
      <Field label="Descrição">
        <textarea className="input" rows={3} value={meta.description} onChange={(e) => setMeta({ description: e.target.value })} />
      </Field>
      <Field label="Nível de abstração">
        <select className="input" value={meta.level} onChange={(e) => setMeta({ level: e.target.value as DiagramSummary['level'] })}>
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </Field>
      <ArchitecturePicker
        styleIds={meta.styleIds}
        patternIds={meta.patternIds}
        onStyles={(styleIds) => setMeta({ styleIds })}
        onPatterns={(patternIds) => setMeta({ patternIds })}
      />
      <div className="props-sep" />
      <label className="check">
        <input type="checkbox" checked={settings.showGrid} onChange={(e) => setSettings({ showGrid: e.target.checked })} />
        Exibir grid
      </label>
      <label className="check">
        <input type="checkbox" checked={settings.snapToGrid} onChange={(e) => setSettings({ snapToGrid: e.target.checked })} />
        Snap to grid
      </label>
      <label className="check">
        <input type="checkbox" checked={settings.showMinimap} onChange={(e) => setSettings({ showMinimap: e.target.checked })} />
        Minimapa
      </label>
      {parents.length > 0 && (
        <>
          <div className="props-sep" />
          <div className="field-label">Referenciado por</div>
          {parents.map((p) => (
            <button key={p.id} className="link-btn" onClick={() => onOpenDiagram(p.id)}>
              <ExternalLink size={12} />
              {p.name}
            </button>
          ))}
        </>
      )}
      <p className="field-hint">{count}</p>
    </div>
  );
}

function MultiProps({ nodes, edges }: { nodes: number; edges: number }) {
  const s = useEditorStore.getState();
  return (
    <div className="props-form">
      <div className="props-kicker">Seleção múltipla</div>
      <p className="muted small">
        {nodes} componentes{edges ? ` e ${edges} conexões` : ''} selecionados. Use a barra de ferramentas para alinhar, distribuir ou
        duplicar.
      </p>
      <button className="btn btn-danger btn-sm" onClick={() => s.deleteSelection()}>
        <Trash2 size={13} />
        Excluir seleção
      </button>
    </div>
  );
}

function NodeProps({ id, siblings, onOpenDiagram, onCreateLinked, onSaveReusable, onComponentEdited }: { id: string } & Props) {
  const node = useEditorStore((s) => s.nodes.find((n) => n.id === id));
  const storeUpdate = useEditorStore((s) => s.updateNodeProps);
  const storeSetType = useEditorStore((s) => s.setNodeType);
  const detach = useEditorStore((s) => s.detachComponent);
  const isShared = !!node?.data.componentId;
  const update: typeof storeUpdate = (nid, patch, coalesce) => {
    storeUpdate(nid, patch, coalesce);
    if (isShared && Object.keys(patch).some((k) => k !== 'linkedDiagramId')) onComponentEdited(nid);
  };
  const setType: typeof storeSetType = (nid, typeId) => {
    storeSetType(nid, typeId);
    if (isShared) onComponentEdited(nid);
  };
  const rf = useReactFlow();
  if (!node) return null;
  const p = node.data.properties;
  const def = getComponentType(node.data.typeId);
  const cat = getCategory(def.category);
  const Icon = getIcon(def.icon);
  const isBoundary = def.shape === 'boundary';
  const others = siblings.filter((d) => d.id !== useEditorStore.getState().meta?.id);
  const linked = siblings.find((d) => d.id === p.linkedDiagramId);

  const setMeta = (key: string, value: string) => update(id, { metadata: { ...p.metadata, [key]: value } });
  const customKeys = Object.keys(p.metadata).filter((k) => !def.metadataFields.some((f) => f.key === k));

  return (
    <div className="props-form">
      <div className="props-kicker" style={{ ['--accent' as string]: cat.color }}>
        <Icon size={13} />
        {def.label}
      </div>
      {isShared && (
        <SharedBanner>
          <Link2 size={13} />
          <span>Componente compartilhado: as alterações valem para todos os diagramas deste projeto.</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => detach(id)}
            title="Mantém as propriedades atuais como uma cópia independente"
          >
            <Link2Off size={13} />
            Desvincular
          </button>
        </SharedBanner>
      )}
      <Field label="Nome">
        <input className="input" value={p.name} onChange={(e) => update(id, { name: e.target.value })} />
      </Field>
      <Field label="Tipo">
        <select className="input" value={node.data.typeId} onChange={(e) => setType(id, e.target.value)}>
          {CATEGORIES.map((c) => (
            <optgroup key={c.id} label={c.label}>
              {COMPONENT_TYPES.filter((t) => t.category === c.id).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>
      <Field label="Descrição">
        <textarea className="input" rows={2} value={p.description} onChange={(e) => update(id, { description: e.target.value })} />
      </Field>
      {!isBoundary && node.data.typeId !== 'note' && (
        <>
          <Field label="Tecnologia">
            <input
              className="input"
              value={p.technology}
              placeholder="ex.: .NET, PostgreSQL"
              onChange={(e) => update(id, { technology: e.target.value })}
            />
          </Field>
          <Field label="Responsabilidade">
            <textarea
              className="input"
              rows={2}
              value={p.responsibility}
              onChange={(e) => update(id, { responsibility: e.target.value })}
            />
          </Field>
        </>
      )}
      <Field label="Padrão arquitetural interno">
        <select className="input" value={p.patternId ?? ''} onChange={(e) => update(id, { patternId: e.target.value || undefined }, false)}>
          <option value="">Nenhum / não se aplica</option>
          {ARCHITECTURAL_PATTERNS.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Observações técnicas">
        <textarea className="input" rows={3} value={p.notes} onChange={(e) => update(id, { notes: e.target.value })} />
      </Field>

      {(def.metadataFields.length > 0 || customKeys.length > 0) && <div className="props-sep" />}
      {def.metadataFields.map((f) => (
        <Field key={f.key} label={f.label}>
          <input
            className="input"
            value={p.metadata[f.key] ?? ''}
            placeholder={f.placeholder}
            onChange={(e) => setMeta(f.key, e.target.value)}
          />
        </Field>
      ))}
      {customKeys.map((k) => (
        <div className="kv" key={k}>
          <input className="input" value={k} readOnly aria-label="Chave" />
          <input className="input" value={p.metadata[k]} onChange={(e) => setMeta(k, e.target.value)} aria-label="Valor" />
          <button
            className="icon-btn"
            aria-label="Remover"
            onClick={() => {
              const { [k]: _, ...rest } = p.metadata;
              void _;
              update(id, { metadata: rest }, false);
            }}
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => {
          const k = window.prompt('Nome do metadado (ex.: SLA)');
          if (k?.trim() && !(k in p.metadata)) setMeta(k.trim(), '');
        }}
      >
        <Plus size={13} />
        Metadado
      </button>

      <div className="props-sep" />
      <div className="field-label">Links e documentação</div>
      {p.links.map((l, i) => (
        <div className="kv" key={i}>
          <input
            className="input"
            placeholder="Rótulo"
            value={l.label}
            onChange={(e) => update(id, { links: p.links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
          />
          <input
            className="input"
            placeholder="https://"
            value={l.url}
            onChange={(e) => update(id, { links: p.links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })}
          />
          <button
            className="icon-btn"
            aria-label="Remover link"
            onClick={() => update(id, { links: p.links.filter((_, j) => j !== i) }, false)}
          >
            <X size={13} />
          </button>
          {/^https?:\/\//.test(l.url) && (
            <a className="icon-btn" href={l.url} target="_blank" rel="noreferrer noopener" aria-label="Abrir">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      ))}
      <button className="btn btn-ghost btn-sm" onClick={() => update(id, { links: [...p.links, { label: '', url: '' }] }, false)}>
        <Plus size={13} />
        Link
      </button>

      {!isBoundary && node.data.typeId !== 'note' && (
        <>
          <div className="props-sep" />
          <Field label="Diagrama de detalhe" hint="Navegue do nível macro ao detalhado (duplo clique no componente).">
            <select
              className="input"
              value={p.linkedDiagramId ?? ''}
              onChange={(e) => update(id, { linkedDiagramId: e.target.value || undefined }, false)}
            >
              <option value="">Nenhum</option>
              {others.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="row wrap">
            {linked && (
              <button className="btn btn-sm" onClick={() => onOpenDiagram(linked.id)}>
                <ExternalLink size={13} />
                Abrir diagrama
              </button>
            )}
            <button className="btn btn-sm" onClick={() => onCreateLinked(id)}>
              <FilePlus2 size={13} />
              Criar diagrama de detalhe
            </button>
          </div>
        </>
      )}

      <div className="props-sep" />
      <div className="row wrap">
        {!isShared && (
          <button className="btn btn-sm" onClick={() => onSaveReusable(id)}>
            <BookmarkPlus size={13} />
            Salvar na biblioteca do projeto
          </button>
        )}
        <button className="btn btn-sm" onClick={() => void rf.fitView({ nodes: [{ id }], duration: 250, maxZoom: 1.2, padding: 1 })}>
          Centralizar
        </button>
      </div>
      <dl className="ids">
        <dt>Identificador</dt>
        <dd>
          <input className="input mono" value={p.identifier} onChange={(e) => update(id, { identifier: e.target.value })} />
        </dd>
        <dt>ID interno</dt>
        <dd className="mono small muted">{id}</dd>
      </dl>
    </div>
  );
}

function EdgeProps({ id }: { id: string }) {
  const edge = useEditorStore((s) => s.edges.find((e) => e.id === id));
  const sourceName = useEditorStore((s) => s.nodes.find((n) => n.id === edge?.source)?.data.properties.name);
  const targetName = useEditorStore((s) => s.nodes.find((n) => n.id === edge?.target)?.data.properties.name);
  const update = useEditorStore((s) => s.updateEdgeData);
  const reverse = useEditorStore((s) => s.reverseEdge);
  const setWaypoints = useEditorStore((s) => s.setEdgeWaypoints);
  if (!edge?.data) return null;
  const d = edge.data;
  const kind = getConnectionKind(d.kind);

  const changeKind = (kid: string) => {
    const k = getConnectionKind(kid);
    update(id, { kind: kid, protocol: k.defaultProtocol, sync: k.sync, direction: k.direction }, false);
  };

  return (
    <div className="props-form">
      <div className="props-kicker">Conexão</div>
      <p className="route mono small">
        {sourceName ?? '?'} <ArrowLeftRight size={12} /> {targetName ?? '?'}
      </p>
      <Field label="Tipo de relacionamento">
        <select className="input" value={d.kind} onChange={(e) => changeKind(e.target.value)}>
          {CONNECTION_KINDS.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
      </Field>
      <p className="field-hint">{kind.description}</p>
      <Field label="Rótulo">
        <input className="input" value={d.label} placeholder="ex.: cria pedido" onChange={(e) => update(id, { label: e.target.value })} />
      </Field>
      <Field label="Protocolo">
        <input className="input" value={d.protocol} onChange={(e) => update(id, { protocol: e.target.value })} />
      </Field>
      <Field label="Comunicação">
        <div className="segmented full">
          {(['sync', 'async'] as EdgeSync[]).map((v) => (
            <button key={v} className={d.sync === v ? 'on' : ''} onClick={() => update(id, { sync: v }, false)}>
              {v === 'sync' ? 'Síncrona' : 'Assíncrona'}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Direção">
        <div className="segmented full">
          {(
            [
              ['forward', 'A → B'],
              ['both', 'A ⇄ B'],
              ['none', 'A — B'],
            ] as [EdgeDirection, string][]
          ).map(([v, l]) => (
            <button key={v} className={d.direction === v ? 'on' : ''} onClick={() => update(id, { direction: v }, false)}>
              {l}
            </button>
          ))}
        </div>
      </Field>
      <div className="row wrap">
        <button className="btn btn-sm" onClick={() => reverse(id)}>
          <ArrowLeftRight size={13} />
          Inverter sentido
        </button>
        <button
          className="btn btn-sm"
          disabled={!d.waypoints?.length}
          onClick={() => {
            useEditorStore.getState().commit();
            setWaypoints(id, undefined);
          }}
        >
          Rota automática
        </button>
      </div>
      <p className="field-hint">
        Arraste os pontos da linha para reposicioná-la; arraste o ponto “+” de um trecho para criar uma curva; duplo clique em um ponto o
        remove. Arraste as pontas para religar a outro componente.
      </p>
      <Field label="Descrição">
        <textarea className="input" rows={3} value={d.description} onChange={(e) => update(id, { description: e.target.value })} />
      </Field>
    </div>
  );
}
