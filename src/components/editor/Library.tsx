import { ChevronDown, ChevronRight, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getIcon } from '@/components/ui/iconMap';
import { CATEGORIES, COMPONENT_TYPES, getComponentType } from '@/data/componentCatalog';
import type { ReusableComponent } from '@/types';

export const DND_TYPE = 'application/x-archdraw-type';
export const DND_REUSABLE = 'application/x-archdraw-reusable';

interface Props {
  reusables: ReusableComponent[];
  onAdd: (typeId: string) => void;
  onAddReusable: (r: ReusableComponent) => void;
  onRemoveReusable: (id: string) => void;
  usage?: Record<string, number>;
}

export function Library({ reusables, onAdd, onAddReusable, onRemoveReusable, usage }: Props) {
  const [q, setQ] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const term = q.trim().toLowerCase();

  const groups = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        items: COMPONENT_TYPES.filter(
          (t) => t.category === c.id && (!term || t.label.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)),
        ),
      })).filter((g) => g.items.length),
    [term],
  );
  const filteredReusables = reusables.filter((r) => !term || r.properties.name.toLowerCase().includes(term));

  return (
    <aside className="library">
      <div className="panel-title">Componentes</div>
      <div className="searchbar compact">
        <Search size={14} />
        <input placeholder="Buscar componente…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="library-scroll">
        {filteredReusables.length > 0 && (
          <section>
            <div className="lib-cat static">Do projeto</div>
            {filteredReusables.map((r) => {
              const t = getComponentType(r.typeId);
              const Icon = getIcon(t.icon);
              return (
                <div
                  key={r.id}
                  className="lib-item"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DND_REUSABLE, r.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => onAddReusable(r)}
                  title="Arraste ou clique para adicionar"
                >
                  <Icon size={15} />
                  <span>{r.properties.name}</span>
                  {!!usage?.[r.id] && (
                    <small className="muted" title="Nós que usam este componente">
                      {usage[r.id]}×
                    </small>
                  )}
                  <button
                    className="icon-btn mini"
                    title="Remover da biblioteca"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveReusable(r.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </section>
        )}
        {groups.map((g) => {
          const isCollapsed = collapsed[g.id] && !term;
          return (
            <section key={g.id} style={{ ['--accent' as string]: g.color }}>
              <button className="lib-cat" onClick={() => setCollapsed((s) => ({ ...s, [g.id]: !s[g.id] }))}>
                {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                <i className="dot" />
                {g.label}
              </button>
              {!isCollapsed &&
                g.items.map((t) => {
                  const Icon = getIcon(t.icon);
                  return (
                    <div
                      key={t.id}
                      className="lib-item"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DND_TYPE, t.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => onAdd(t.id)}
                      title={`${t.description}\nArraste ou clique para adicionar`}
                    >
                      <Icon size={15} />
                      <span>{t.label}</span>
                    </div>
                  );
                })}
            </section>
          );
        })}
        {!groups.length && !filteredReusables.length && <p className="side-empty">Nada encontrado.</p>}
      </div>
    </aside>
  );
}
