import { EditorSkeleton } from '@/components/ui/Skeleton';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { ArrowLeft, ChevronRight, CornerLeftUp, Download, FileImage, FileText, Image as ImageIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Canvas, type Tool } from '@/components/editor/Canvas';
import { ConflictDialog } from '@/components/editor/ConflictDialog';
import { DraftRecoveryDialog } from '@/components/editor/DraftRecoveryDialog';
import { Library } from '@/components/editor/Library';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { SaveIndicator } from '@/components/editor/SaveIndicator';
import { ShortcutsModal } from '@/components/editor/ShortcutsModal';
import { Toolbar } from '@/components/editor/Toolbar';
import { DocPanel } from '@/components/markdown/DocPanel';
import { NewDiagramModal } from '@/components/project/NewDiagramModal';
import { Menu } from '@/components/ui/Menu';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PATTERN_IDS } from '@/data/architecture';
import { getComponentType } from '@/data/componentCatalog';
import { componentToReusable } from '@/domain/projectBundle';
import { useArchitecturalComponents } from '@/hooks/useArchitecturalComponents';
import { useCreateComponent } from '@/hooks/useCreateComponent';
import { useCreateDiagram } from '@/hooks/useCreateDiagram';
import { useCreateDiagramFromSnapshot } from '@/hooks/useCreateDiagramFromSnapshot';
import { useDeleteComponent } from '@/hooks/useDeleteComponent';
import { useDiagram } from '@/hooks/useDiagram';
import { useDiagramParents } from '@/hooks/useDiagramParents';
import { useDiagrams } from '@/hooks/useDiagrams';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import { useExportDiagramReadme } from '@/hooks/useExportDiagramReadme';
import { useExportProject } from '@/hooks/useExportProject';
import { useProject } from '@/hooks/useProject';
import { useSaveDiagram } from '@/hooks/useSaveDiagram';
import { useUpdateComponent } from '@/hooks/useUpdateComponent';
import { imageExport } from '@/services/imageExport';
import { useEditorStore } from '@/store/editorStore';
import { draftStorage, type DiagramDraft } from '@/utils/draftStorage';
import { getApiErrorBody } from '@/utils/apiError';
import { slugify } from '@/utils/id';
import { downloadDataUrl, downloadText } from '@/utils/download';

type View = 'diagram' | 'split' | 'doc';
const VIEW_KEY = 'archdraw.editorView';
const PATTERN_TEMPLATE: Record<string, string> = {
  [PATTERN_IDS.clean]: 'pattern-clean',
  [PATTERN_IDS.verticalSlice]: 'pattern-vertical-slice',
  [PATTERN_IDS.layered]: 'pattern-layered',
};
const COMPONENT_SYNC_DELAY = 600;

export function EditorPage() {
  const { projectId = '', diagramId = '' } = useParams();
  return (
    <ReactFlowProvider key={diagramId}>
      <EditorInner projectId={projectId} diagramId={diagramId} />
    </ReactFlowProvider>
  );
}

function EditorInner({ projectId, diagramId }: { projectId: string; diagramId: string }) {
  const nav = useNavigate();
  const toast = useToast();
  const rf = useReactFlow();
  const [ready, setReady] = useState(false);
  const [tool, setTool] = useState<Tool>('select');
  const [view, setViewState] = useState<View>(() => (localStorage.getItem(VIEW_KEY) as View) || 'diagram');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [linkingFor, setLinkingFor] = useState<string | null>(null);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [draft, setDraft] = useState<{ draft: DiagramDraft; stale: boolean } | null>(null);
  const [removingComponent, setRemovingComponent] = useState<{ id: string; usage: number } | null>(null);

  const { diagram, loading, notFound, error } = useDiagram(diagramId);
  const save = useSaveDiagram(ready);
  const { project } = useProject(projectId);
  const { diagrams: siblings } = useDiagrams(projectId);
  const { parents } = useDiagramParents(diagramId);
  const { components } = useArchitecturalComponents(projectId);
  const createDiagram = useCreateDiagram();
  const createFromSnapshot = useCreateDiagramFromSnapshot();
  const createComponent = useCreateComponent();
  const updateComponent = useUpdateComponent();
  const deleteComponent = useDeleteComponent();
  const exportProject = useExportProject();
  const exportReadme = useExportDiagramReadme();
  const meta = useEditorStore((s) => s.meta);
  const { flush } = save;

  const reusables = useMemo(() => (components ?? []).map(componentToReusable), [components]);
  const usage = useMemo(() => Object.fromEntries((components ?? []).map((c) => [c.id, c.usageCount])), [components]);
  const missing = notFound || (!!diagram && diagram.projectId !== projectId);

  const setView = (v: View) => {
    setViewState(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {}
  };

  useEffect(() => {
    if (!diagram || diagram.projectId !== projectId) return;
    useEditorStore.getState().load(diagram);
    setReady(true);
    const local = draftStorage.read(diagram.id);
    if (local) setDraft({ draft: local, stale: local.baseRevision !== diagram.revision });
    return () => {
      void flush().finally(() => {
        if (useEditorStore.getState().meta?.id === diagramId) useEditorStore.getState().reset();
      });
    };
  }, [diagram, projectId]);

  useEffect(() => {
    if (save.status === 'conflict') setConflictOpen(true);
  }, [save.status]);

  const componentTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const pushComponent = useCallback(
    async (componentId: string) => {
      const node = useEditorStore.getState().nodes.find((n) => n.data.componentId === componentId);
      if (!node) return;
      try {
        await updateComponent.execute(componentId, node.data.typeId, node.data.properties);
      } catch (e) {
        toast((e as Error).message, 'error');
      }
    },
    [],
  );
  const onComponentEdited = useCallback(
    (nodeId: string) => {
      const componentId = useEditorStore.getState().nodes.find((n) => n.id === nodeId)?.data.componentId;
      if (!componentId) return;
      const timers = componentTimers.current;
      clearTimeout(timers.get(componentId));
      timers.set(
        componentId,
        setTimeout(() => {
          timers.delete(componentId);
          void pushComponent(componentId);
        }, COMPONENT_SYNC_DELAY),
      );
    },
    [pushComponent],
  );
  const flushComponentEdits = useCallback(() => {
    for (const [componentId, timer] of componentTimers.current) {
      clearTimeout(timer);
      void pushComponent(componentId);
    }
    componentTimers.current.clear();
  }, [pushComponent]);
  useEffect(() => flushComponentEdits, [flushComponentEdits]);

  const openDiagram = useCallback(
    async (id: string) => {
      flushComponentEdits();
      await flush();
      nav(`/projects/${projectId}/diagrams/${id}`);
    },
    [flush, flushComponentEdits, nav, projectId],
  );

  const toggleDoc = useCallback(() => setViewState((v) => (v === 'doc' ? 'diagram' : 'doc')), []);
  useEditorShortcuts({ onSave: () => void flush().then(() => toast('Salvo.', 'success')), onToggleDoc: toggleDoc, onTool: setTool });

  const addAtCenter = (typeId: string) => {
    const el = document.querySelector('.react-flow');
    const r = el?.getBoundingClientRect();
    const def = getComponentType(typeId);
    const c = rf.screenToFlowPosition({ x: (r?.left ?? 0) + (r?.width ?? 600) / 2, y: (r?.top ?? 0) + (r?.height ?? 400) / 2 });
    const g = useEditorStore.getState().settings;
    const snap = (v: number) => (g.snapToGrid ? Math.round(v / g.gridSize) * g.gridSize : v);
    useEditorStore.getState().addNode(typeId, { x: snap(c.x - def.size.width / 2), y: snap(c.y - def.size.height / 2) });
  };

  const exportImage = async (kind: 'png' | 'svg') => {
    try {
      const nodes = useEditorStore.getState().nodes;
      const url = kind === 'png' ? await imageExport.png(nodes) : await imageExport.svg(nodes);
      await downloadDataUrl(url, `${slugify(meta?.name ?? 'diagrama')}.${kind}`);
    } catch (e) {
      toast((e as Error).message || 'Falha ao exportar imagem.', 'error');
    }
  };

  const createLinked = async (name: string, templateId: string) => {
    if (!linkingFor) return;
    const nodeId = linkingFor;
    const d = await createDiagram.execute(projectId, { name, templateId });
    useEditorStore.getState().updateNodeProps(nodeId, { linkedDiagramId: d.id }, false);
    await flush();
    toast(`Diagrama "${d.name}" criado e vinculado.`, 'success');
  };

  const saveReusable = async (nodeId: string) => {
    const n = useEditorStore.getState().nodes.find((x) => x.id === nodeId);
    if (!n) return;
    try {
      const component = await createComponent.execute(projectId, n.data.typeId, n.data.properties);
      useEditorStore.getState().linkComponent(nodeId, component.id);
      toast('Componente salvo na biblioteca do projeto e vinculado a este nó.', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const removeComponent = async (id: string, detach: boolean) => {
    try {
      await deleteComponent.execute(id, detach);
      if (detach) useEditorStore.getState().unlinkComponentEverywhere(id);
      setRemovingComponent(null);
      toast('Componente removido da biblioteca.');
    } catch (e) {
      const body = getApiErrorBody((e as Error & { cause?: unknown }).cause);
      if (body?.code === 'Component.InUse') {
        setRemovingComponent({ id, usage: Number(body.metadata?.usageCount ?? 0) });
        return;
      }
      toast((e as Error).message, 'error');
    }
  };

  const recoverDraft = () => {
    if (!draft || !diagram) return;
    const { content } = draft.draft;
    useEditorStore.getState().load({ ...diagram, ...content });
    useEditorStore.getState().markDirty();
    setDraft(null);
    toast('Alterações não sincronizadas recuperadas.', 'success');
  };

  const draftAsCopy = async () => {
    if (!draft || !diagram) return;
    try {
      const copy = await createFromSnapshot.execute(
        projectId,
        { ...diagram, name: `${diagram.name} (rascunho recuperado)` },
        draft.draft.content,
      );
      draftStorage.clear(diagram.id);
      setDraft(null);
      toast(`Rascunho salvo como "${copy.name}".`, 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (missing || (!loading && error && !diagram)) {
    return (
      <div className="page">
        <div className="empty">
          {missing ? 'Diagrama não encontrado.' : error}{' '}
          <Link className="link" to={`/projects/${projectId}`}>
            Voltar ao projeto
          </Link>
        </div>
      </div>
    );
  }
  if (!ready || !meta) return <EditorSkeleton />;

  const linkingNode = linkingFor ? useEditorStore.getState().nodes.find((n) => n.id === linkingFor) : undefined;
  const linkingPattern = linkingNode?.data.properties.patternId;

  return (
    <div className="editor" data-view={view}>
      <header className="ed-head">
        <Link to={`/projects/${projectId}`} className="icon-btn" title="Voltar ao projeto" onClick={() => void flush()}>
          <ArrowLeft size={17} />
        </Link>
        <nav className="ed-crumbs">
          <Link to={`/projects/${projectId}`} onClick={() => void flush()}>
            {project?.name ?? '…'}
          </Link>
          <ChevronRight size={13} />
          <input
            className="ed-name"
            value={meta.name}
            aria-label="Nome do diagrama"
            onChange={(e) => useEditorStore.getState().setMeta({ name: e.target.value })}
          />
        </nav>
        {!!parents?.length && (
          <Menu
            align="left"
            items={parents.map((p) => ({ label: p.name, icon: <CornerLeftUp size={14} />, onClick: () => void openDiagram(p.id) }))}
            trigger={({ toggle }) => (
              <button className="btn btn-ghost btn-sm" onClick={toggle} title="Diagramas que referenciam este">
                <CornerLeftUp size={13} />
                Nível acima
              </button>
            )}
          />
        )}
        <div className="tb-spacer" />
        <SaveIndicator
          status={save.status}
          errorMessage={save.errorMessage}
          onRetry={() => void save.retry()}
          onResolveConflict={() => setConflictOpen(true)}
        />
        <div className="segmented" role="tablist" aria-label="Visualização">
          <button className={view === 'diagram' ? 'on' : ''} onClick={() => setView('diagram')}>
            Diagrama
          </button>
          <button className={view === 'split' ? 'on' : ''} onClick={() => setView('split')}>
            Dividido
          </button>
          <button className={view === 'doc' ? 'on' : ''} onClick={() => setView('doc')}>
            README
          </button>
        </div>
        <Menu
          items={[
            { label: 'Imagem PNG', icon: <ImageIcon size={14} />, onClick: () => void exportImage('png') },
            { label: 'Imagem SVG', icon: <FileImage size={14} />, onClick: () => void exportImage('svg') },
            {
              label: 'README (Markdown)',
              icon: <FileText size={14} />,
              onClick: async () => {
                try {
                  const f = await exportReadme.execute(diagramId, useEditorStore.getState().meta?.name ?? 'diagrama');
                  downloadText(f.text, f.filename, 'text/markdown');
                } catch (e) {
                  toast((e as Error).message, 'error');
                }
              },
            },
            { separator: true, label: '', onClick: () => {} },
            {
              label: 'Projeto completo (JSON)',
              icon: <Download size={14} />,
              onClick: async () => {
                try {
                  await flush();
                  const f = await exportProject.execute(projectId, 'json');
                  downloadText(f.text, f.filename, f.mime);
                } catch (e) {
                  toast((e as Error).message, 'error');
                }
              },
            },
          ]}
          trigger={({ toggle }) => (
            <button className="btn btn-sm" onClick={toggle}>
              <Download size={14} />
              Exportar
            </button>
          )}
        />
      </header>

      {view !== 'doc' && <Toolbar tool={tool} onTool={setTool} onShortcuts={() => setShowShortcuts(true)} />}

      <div className="ed-body">
        {view !== 'doc' && (
          <Library
            reusables={reusables}
            usage={usage}
            onAdd={addAtCenter}
            onAddReusable={(r) => useEditorStore.getState().addReusable(r, { x: 80, y: 80 })}
            onRemoveReusable={(id) => void removeComponent(id, false)}
          />
        )}
        <div className="ed-center">
          <div className="ed-canvas">
            <Canvas tool={tool} reusables={reusables} onOpenDiagram={(id) => void openDiagram(id)} />
          </div>
          {view !== 'diagram' && (
            <div className="ed-doc">
              <DocPanel scope="diagram" ownerId={diagramId} compact={view === 'split'} />
            </div>
          )}
        </div>
        {view !== 'doc' && (
          <PropertiesPanel
            siblings={siblings ?? []}
            parents={parents ?? []}
            onOpenDiagram={(id) => void openDiagram(id)}
            onCreateLinked={setLinkingFor}
            onSaveReusable={(id) => void saveReusable(id)}
            onComponentEdited={onComponentEdited}
          />
        )}
      </div>

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {linkingFor && (
        <NewDiagramModal
          initialName={`${linkingNode?.data.properties.name ?? 'Componente'} · Arquitetura interna`}
          initialTemplate={(linkingPattern && PATTERN_TEMPLATE[linkingPattern]) || 'blank'}
          onClose={() => setLinkingFor(null)}
          onSubmit={(v) => createLinked(v.name, v.templateId)}
        />
      )}
      {conflictOpen && save.status === 'conflict' && (
        <ConflictDialog
          conflictRevision={save.conflictRevision}
          baseRevision={useEditorStore.getState().serverRevision}
          onKeepMine={save.resolveKeepMine}
          onUseServer={save.resolveUseServer}
          onSaveAsCopy={async () => {
            const d = useEditorStore.getState().toDiagram();
            const copy = await createFromSnapshot.execute(projectId, { ...d, name: `${d.name} (minha versão)` }, d);
            return copy.id;
          }}
          onClose={() => setConflictOpen(false)}
          onOpenCopy={(id) => toast(`Cópia criada. Abra-a em Diagramas do projeto (${id.slice(0, 8)}).`, 'success')}
        />
      )}
      {draft && (
        <DraftRecoveryDialog
          savedAt={draft.draft.savedAt}
          stale={draft.stale}
          onRecover={recoverDraft}
          onSaveAsCopy={() => void draftAsCopy()}
          onDiscard={() => {
            draftStorage.clear(diagramId);
            setDraft(null);
          }}
        />
      )}
      {removingComponent && (
        <ConfirmDialog
          danger
          title="Componente em uso"
          confirmLabel="Remover e desvincular"
          message={
            <>
              Este componente é usado em <strong>{removingComponent.usage}</strong> nó(s). Ao remover, os nós permanecem nos diagramas como
              cópias independentes.
            </>
          }
          onClose={() => setRemovingComponent(null)}
          onConfirm={() => removeComponent(removingComponent.id, true)}
        />
      )}
    </div>
  );
}
