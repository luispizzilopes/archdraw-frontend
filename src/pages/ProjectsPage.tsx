import { Download, FolderPlus, Pencil, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectFormModal } from '@/components/project/ProjectFormModal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { StyleBadges } from '@/components/ui/StyleBadges';
import { useToast } from '@/components/ui/Toast';
import { useCreateProject } from '@/hooks/useCreateProject';
import { useDeleteProject } from '@/hooks/useDeleteProject';
import { useExportProject } from '@/hooks/useExportProject';
import { useProjects } from '@/hooks/useProjects';
import { useUpdateProject } from '@/hooks/useUpdateProject';
import type { Project } from '@/types';
import { downloadText } from '@/utils/download';
import { formatDateTime } from '@/utils/format';

export function ProjectsPage() {
  const nav = useNavigate();
  const toast = useToast();
  const { projects, loading, error } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const exportProject = useExportProject();
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (projects ?? []).filter((p) => !t || p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t));
  }, [projects, q]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Projetos</h1>
          <p className="muted">Cada projeto agrupa os diagramas e a documentação de um sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <FolderPlus size={15} />
          Novo projeto
        </button>
      </header>

      <div className="searchbar">
        <Search size={15} />
        <input placeholder="Buscar projetos…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error && <div className="empty">{error}</div>}
      {!error && !loading && filtered.length === 0 && (
        <div className="empty">{projects?.length ? 'Nenhum projeto corresponde à busca.' : 'Nenhum projeto criado.'}</div>
      )}

      {loading && !projects && <ListSkeleton />}

      {!!filtered.length && <div className="list">
        {filtered.map((p) => (
          <div key={p.id} className="list-row">
            <Link to={`/projects/${p.id}`} className="list-main">
              <div className="card-title">{p.name}</div>
              <p className="muted small">{p.description || 'Sem descrição.'}</p>
              <StyleBadges styleIds={p.secondaryStyleIds} primary={p.primaryStyleId} />
            </Link>
            <div className="list-meta muted small">
              <div>Criado {formatDateTime(p.createdAt)}</div>
              <div>Atualizado {formatDateTime(p.updatedAt)}</div>
            </div>
            <div className="row-actions">
              <button
                className="icon-btn"
                title="Exportar JSON"
                onClick={async () => {
                  try {
                    const f = await exportProject.execute(p.id, 'json');
                    downloadText(f.text, f.filename, f.mime);
                  } catch (e) {
                    toast((e as Error).message, 'error');
                  }
                }}
              >
                <Download size={15} />
              </button>
              <button className="icon-btn" title="Editar" onClick={() => setEditing(p)}>
                <Pencil size={15} />
              </button>
              <button className="icon-btn danger" title="Excluir" onClick={() => setDeleting(p)}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>}

      {creating && (
        <ProjectFormModal
          onClose={() => setCreating(false)}
          onSubmit={async (v) => {
            const p = await createProject.execute(v);
            nav(`/projects/${p.id}`);
          }}
        />
      )}
      {editing && (
        <ProjectFormModal
          project={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (v) => {
            await updateProject.execute(editing.id, v);
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          danger
          title="Excluir projeto"
          confirmLabel="Excluir"
          message={
            <>
              Isso exclui <strong>{deleting.name}</strong>, todos os seus diagramas e documentos. Não há como desfazer.
            </>
          }
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await deleteProject.execute(deleting.id);
              toast('Projeto excluído.');
            } catch (e) {
              toast((e as Error).message, 'error');
            }
          }}
        />
      )}
    </div>
  );
}
