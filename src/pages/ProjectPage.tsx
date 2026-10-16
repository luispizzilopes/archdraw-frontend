import { PageLoading } from '@/components/ui/Skeleton';
import { ChevronRight, Copy, Download, FilePlus2, FileText, Pencil, Puzzle, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DocPanel } from '@/components/markdown/DocPanel';
import { NameModal } from '@/components/project/NameModal';
import { NewDiagramModal } from '@/components/project/NewDiagramModal';
import { ProjectFormModal } from '@/components/project/ProjectFormModal';
import { getIcon } from '@/components/ui/iconMap';
import { Menu } from '@/components/ui/Menu';
import { ConfirmDialog } from '@/components/ui/Modal';
import { StyleBadges } from '@/components/ui/StyleBadges';
import { useToast } from '@/components/ui/Toast';
import { getComponentType } from '@/data/componentCatalog';
import { LEVELS } from '@/domain/templates';
import { componentToReusable } from '@/domain/projectBundle';
import { useArchitecturalComponents } from '@/hooks/useArchitecturalComponents';
import { useCreateDiagram } from '@/hooks/useCreateDiagram';
import { useDeleteComponent } from '@/hooks/useDeleteComponent';
import { useDeleteDiagram } from '@/hooks/useDeleteDiagram';
import { useDiagrams } from '@/hooks/useDiagrams';
import { useDuplicateDiagram } from '@/hooks/useDuplicateDiagram';
import { useExportProject } from '@/hooks/useExportProject';
import { useProject } from '@/hooks/useProject';
import { useUpdateDiagram } from '@/hooks/useUpdateDiagram';
import { useUpdateProject } from '@/hooks/useUpdateProject';
import type { DiagramSummary } from '@/types';
import { downloadText } from '@/utils/download';
import { formatRelative } from '@/utils/format';

type Tab = 'diagrams' | 'docs' | 'library';

export function ProjectPage() {
  const { projectId = '' } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { project, loading } = useProject(projectId);
  const { diagrams } = useDiagrams(projectId);
  const { components } = useArchitecturalComponents(projectId);
  const createDiagram = useCreateDiagram();
  const updateDiagram = useUpdateDiagram();
  const deleteDiagram = useDeleteDiagram();
  const duplicateDiagram = useDuplicateDiagram();
  const updateProject = useUpdateProject();
  const deleteComponent = useDeleteComponent();
  const exportProject = useExportProject();
  const [tab, setTab] = useState<Tab>('diagrams');
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [renaming, setRenaming] = useState<DiagramSummary | null>(null);
  const [deleting, setDeleting] = useState<DiagramSummary | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (diagrams ?? []).filter((d) => !t || d.name.toLowerCase().includes(t));
  }, [diagrams, q]);

  if (loading) return <PageLoading />;
  if (!project)
    return (
      <div className="page">
        <div className="empty">
          Projeto não encontrado.{' '}
          <Link to="/projects" className="link">
            Voltar
          </Link>
        </div>
      </div>
    );

  const doExport = async (format: 'json' | 'markdown') => {
    try {
      const f = await exportProject.execute(project.id, format);
      downloadText(f.text, f.filename, f.mime);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const open = (d: DiagramSummary) => nav(`/projects/${project.id}/diagrams/${d.id}`);

  return (
    <div className="page">
      <nav className="crumbs">
        <Link to="/projects">Projetos</Link>
        <ChevronRight size={13} />
        <span>{project.name}</span>
      </nav>
      <header className="page-head">
        <div>
          <h1>{project.name}</h1>
          <p className="muted">{project.description || 'Sem descrição.'}</p>
          <StyleBadges styleIds={project.secondaryStyleIds} primary={project.primaryStyleId} />
        </div>
        <div className="row">
          <Menu
            items={[
              { label: 'Projeto (JSON)', icon: <Download size={14} />, onClick: () => void doExport('json') },
              { label: 'Documentação (Markdown)', icon: <FileText size={14} />, onClick: () => void doExport('markdown') },
            ]}
            trigger={({ toggle }) => (
              <button className="btn" onClick={toggle}>
                <Download size={15} />
                Exportar
              </button>
            )}
          />
          <button className="btn" onClick={() => setEditing(true)}>
            <Pencil size={15} />
            Editar
          </button>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <FilePlus2 size={15} />
            Novo diagrama
          </button>
        </div>
      </header>

      <div className="tabs">
        <button className={tab === 'diagrams' ? 'on' : ''} onClick={() => setTab('diagrams')}>
          Diagramas <span className="count">{diagrams?.length ?? 0}</span>
        </button>
        <button className={tab === 'docs' ? 'on' : ''} onClick={() => setTab('docs')}>
          Documentação geral
        </button>
        <button className={tab === 'library' ? 'on' : ''} onClick={() => setTab('library')}>
          Componentes reutilizáveis <span className="count">{components?.length ?? 0}</span>
        </button>
      </div>

      {tab === 'diagrams' && (
        <>
          <div className="searchbar">
            <Search size={15} />
            <input placeholder="Buscar diagramas…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {filtered.length === 0 && (
            <div className="empty">
              {diagrams?.length ? 'Nenhum diagrama corresponde à busca.' : 'Este projeto ainda não tem diagramas.'}
            </div>
          )}
          <div className="card-grid">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="card card-link"
                onClick={() => open(d)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && open(d)}
              >
                <div className="card-top">
                  <div className="card-title">{d.name}</div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Menu
                      items={[
                        { label: 'Renomear', icon: <Pencil size={14} />, onClick: () => setRenaming(d) },
                        {
                          label: 'Duplicar',
                          icon: <Copy size={14} />,
                          onClick: async () => {
                            try {
                              await duplicateDiagram.execute(d.id);
                              toast('Diagrama duplicado.', 'success');
                            } catch (e) {
                              toast((e as Error).message, 'error');
                            }
                          },
                        },
                        { separator: true, label: '', onClick: () => {} },
                        { label: 'Excluir', icon: <Trash2 size={14} />, danger: true, onClick: () => setDeleting(d) },
                      ]}
                      trigger={({ toggle }) => (
                        <button className="icon-btn" onClick={toggle} aria-label="Ações">
                          ⋯
                        </button>
                      )}
                    />
                  </div>
                </div>
                <div className="muted small">{LEVELS.find((l) => l.id === d.level)?.label}</div>
                <StyleBadges styleIds={d.styleIds} patternIds={d.patternIds} />
                <div className="card-foot">
                  <span>
                    {d.nodeCount} componentes · {d.connectionCount} conexões
                  </span>
                  <span>{formatRelative(d.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'docs' && (
        <div className="doc-frame">
          <DocPanel scope="project" ownerId={project.id} />
        </div>
      )}

      {tab === 'library' && (
        <>
          {(components ?? []).length === 0 && (
            <div className="empty">
              Nenhum componente salvo. No editor, selecione um componente e use <strong>Salvar na biblioteca do projeto</strong> para
              reutilizá-lo em qualquer diagrama.
            </div>
          )}
          <div className="card-grid">
            {(components ?? []).map(componentToReusable).map((r) => {
              const t = getComponentType(r.typeId);
              const Icon = getIcon(t.icon);
              return (
                <div key={r.id} className="card">
                  <div className="card-top">
                    <div className="card-title row">
                      <Icon size={15} />
                      {r.properties.name}
                    </div>
                    <button
                      className="icon-btn danger"
                      title="Remover"
                      onClick={async () => {
                        try {
                          await deleteComponent.execute(r.id, true);
                          toast('Removido da biblioteca.');
                        } catch (e) {
                          toast((e as Error).message, 'error');
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="muted small">
                    <Puzzle size={12} /> {t.label}
                    {r.properties.technology ? ` · ${r.properties.technology}` : ''}
                  </div>
                  <p className="muted small clamp">{r.properties.responsibility || r.properties.description || '—'}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {creating && (
        <NewDiagramModal
          onClose={() => setCreating(false)}
          onSubmit={async (v) => {
            const d = await createDiagram.execute(project.id, { name: v.name, templateId: v.templateId });
            nav(`/projects/${project.id}/diagrams/${d.id}`);
          }}
        />
      )}
      {editing && (
        <ProjectFormModal
          project={project}
          onClose={() => setEditing(false)}
          onSubmit={async (v) => {
            await updateProject.execute(project.id, v);
          }}
        />
      )}
      {renaming && (
        <NameModal
          title="Renomear diagrama"
          initial={renaming.name}
          onClose={() => setRenaming(null)}
          onSubmit={async (name) => {
            await updateDiagram.execute(renaming.id, {
              name,
              description: renaming.description,
              level: renaming.level,
              styleIds: renaming.styleIds,
              patternIds: renaming.patternIds,
            });
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          danger
          title="Excluir diagrama"
          confirmLabel="Excluir"
          message={
            <>
              O diagrama <strong>{deleting.name}</strong> e seu README serão excluídos.
            </>
          }
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await deleteDiagram.execute(deleting.id);
              toast('Diagrama excluído.');
            } catch (e) {
              toast((e as Error).message, 'error');
            }
          }}
        />
      )}
    </div>
  );
}
