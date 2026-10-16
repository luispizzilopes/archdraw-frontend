import { useReactFlow } from '@xyflow/react';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceAround,
  BringToFront,
  Copy,
  Grid3x3,
  Hand,
  Keyboard,
  Magnet,
  Map as MapIcon,
  Maximize,
  MousePointer2,
  Redo2,
  SendToBack,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Menu } from '@/components/ui/Menu';
import { CONNECTION_KINDS } from '@/data/connectionCatalog';
import { useEditorStore } from '@/store/editorStore';
import type { Tool } from './Canvas';

interface Props {
  tool: Tool;
  onTool: (t: Tool) => void;
  onShortcuts: () => void;
}

function Btn({
  icon: Icon,
  title,
  onClick,
  disabled,
  active,
}: {
  icon: typeof Copy;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button className={`tb-btn ${active ? 'on' : ''}`} title={title} aria-label={title} onClick={onClick} disabled={disabled}>
      <Icon size={16} />
    </button>
  );
}

export function Toolbar({ tool, onTool, onShortcuts }: Props) {
  const rf = useReactFlow();
  const s = useEditorStore();
  const selCount = useEditorStore(
    useShallow((st) => st.nodes.filter((n) => n.selected).length + st.edges.filter((e) => e.selected).length),
  );
  const nodeSel = useEditorStore((st) => st.nodes.filter((n) => n.selected).length);
  const zoom = useEditorStore((st) => st.viewport.zoom);

  return (
    <div className="toolbar" role="toolbar">
      <div className="tb-group">
        <Btn icon={MousePointer2} title="Selecionar (V)" onClick={() => onTool('select')} active={tool === 'select'} />
        <Btn icon={Hand} title="Mover canvas (H)" onClick={() => onTool('pan')} active={tool === 'pan'} />
      </div>
      <div className="tb-group">
        <Btn icon={Undo2} title="Desfazer (Ctrl+Z)" onClick={s.undo} disabled={!s.past.length} />
        <Btn icon={Redo2} title="Refazer (Ctrl+Shift+Z)" onClick={s.redo} disabled={!s.future.length} />
      </div>
      <div className="tb-group">
        <Btn icon={Copy} title="Duplicar (Ctrl+D)" onClick={s.duplicateSelection} disabled={!nodeSel} />
        <Btn icon={Trash2} title="Excluir (Delete)" onClick={s.deleteSelection} disabled={!selCount} />
        <Btn icon={BringToFront} title="Trazer para frente" onClick={() => s.bringForward(true)} disabled={!nodeSel} />
        <Btn icon={SendToBack} title="Enviar para trás" onClick={() => s.bringForward(false)} disabled={!nodeSel} />
      </div>
      <div className="tb-group">
        <Menu
          align="left"
          items={[
            {
              label: 'Alinhar à esquerda',
              icon: <AlignStartVertical size={14} />,
              onClick: () => s.alignSelection('left'),
              disabled: nodeSel < 2,
            },
            {
              label: 'Centralizar horizontalmente',
              icon: <AlignCenterVertical size={14} />,
              onClick: () => s.alignSelection('center'),
              disabled: nodeSel < 2,
            },
            {
              label: 'Alinhar à direita',
              icon: <AlignEndVertical size={14} />,
              onClick: () => s.alignSelection('right'),
              disabled: nodeSel < 2,
            },
            { separator: true, label: '', onClick: () => {} },
            {
              label: 'Alinhar ao topo',
              icon: <AlignStartHorizontal size={14} />,
              onClick: () => s.alignSelection('top'),
              disabled: nodeSel < 2,
            },
            {
              label: 'Centralizar verticalmente',
              icon: <AlignCenterHorizontal size={14} />,
              onClick: () => s.alignSelection('middle'),
              disabled: nodeSel < 2,
            },
            {
              label: 'Alinhar à base',
              icon: <AlignEndHorizontal size={14} />,
              onClick: () => s.alignSelection('bottom'),
              disabled: nodeSel < 2,
            },
            { separator: true, label: '', onClick: () => {} },
            {
              label: 'Distribuir horizontalmente',
              icon: <AlignHorizontalSpaceAround size={14} />,
              onClick: () => s.distributeSelection('horizontal'),
              disabled: nodeSel < 3,
            },
            {
              label: 'Distribuir verticalmente',
              icon: <AlignVerticalSpaceAround size={14} />,
              onClick: () => s.distributeSelection('vertical'),
              disabled: nodeSel < 3,
            },
          ]}
          trigger={({ toggle }) => (
            <button className="tb-btn wide" onClick={toggle} title="Alinhamento e distribuição">
              <LayoutGrid size={16} /> <span>Alinhar</span>
            </button>
          )}
        />
      </div>
      <div className="tb-group">
        <label className="tb-select" title="Tipo usado ao criar novas conexões">
          <span>Nova conexão</span>
          <select value={s.defaultEdgeKind} onChange={(e) => s.setDefaultEdgeKind(e.target.value)}>
            {CONNECTION_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="tb-spacer" />
      <div className="tb-group">
        <Btn icon={ZoomOut} title="Diminuir zoom" onClick={() => rf.zoomOut({ duration: 120 })} />
        <button className="tb-zoom" onClick={() => rf.zoomTo(1, { duration: 120 })} title="Restaurar 100%">
          {Math.round(zoom * 100)}%
        </button>
        <Btn icon={ZoomIn} title="Aumentar zoom" onClick={() => rf.zoomIn({ duration: 120 })} />
        <Btn icon={Maximize} title="Ajustar à tela (Ctrl+0)" onClick={() => rf.fitView({ padding: 0.2, duration: 200 })} />
      </div>
      <div className="tb-group">
        <Btn
          icon={Grid3x3}
          title="Grid (G)"
          onClick={() => s.setSettings({ showGrid: !s.settings.showGrid })}
          active={s.settings.showGrid}
        />
        <Btn
          icon={Magnet}
          title="Snap to grid"
          onClick={() => s.setSettings({ snapToGrid: !s.settings.snapToGrid })}
          active={s.settings.snapToGrid}
        />
        <Btn
          icon={MapIcon}
          title="Minimapa"
          onClick={() => s.setSettings({ showMinimap: !s.settings.showMinimap })}
          active={s.settings.showMinimap}
        />
        <Btn icon={Keyboard} title="Atalhos" onClick={onShortcuts} />
      </div>
    </div>
  );
}
