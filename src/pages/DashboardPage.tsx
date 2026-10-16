import { ArrowRight, FilePlus2, FolderPlus, Sparkles, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectFormModal } from '@/components/project/ProjectFormModal';
import { CardSkeletonGrid, Spinner } from '@/components/ui/Skeleton';
import { StyleBadges } from '@/components/ui/StyleBadges';
import { useToast } from '@/components/ui/Toast';
import { MigrationBanner } from '@/components/project/MigrationBanner';
import { useCreateProject } from '@/hooks/useCreateProject';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useImportProject } from '@/hooks/useImportProject';
import { useLoadExampleProject } from '@/hooks/useLoadExampleProject';
import { useProjects } from '@/hooks/useProjects';
import { useRecentDiagrams } from '@/hooks/useRecentDiagrams';
import { formatRelative } from '@/utils/format';
import { readFileAsText } from '@/utils/download';

export function DashboardPage() {
  const nav = useNavigate();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { projects, loading: projectsLoading } = useProjects();
  const { recent, loading: recentLoading } = useRecentDiagrams(6);
  const { summary, loading: summaryLoading } = useDashboardSummary();
  const createProject = useCreateProject();
  const importProject = useImportProject();
  const loadExample = useLoadExampleProject();

  const importFile = async (f: File) => {
    try {
      const result = await importProject.execute(await readFileAsText(f));
      toast('Projeto importado.', 'success');
      nav(`/projects/${result.projectId}`);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const openExample = async () => {
    try {
      const result = await loadExample.execute();
      nav(`/projects/${result.projectId}`);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const empty = projects && projects.length === 0;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Modele, documente e navegue pela arquitetura dos seus sistemas.</p>
        </div>
        <div className="row">
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])}
          />
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <Upload size={15} />
            Importar
          </button>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <FolderPlus size={15} />
            Novo projeto
          </button>
        </div>
      </header>

      <section className="stats">
        <div className="stat">
          <span className="stat-n">{summaryLoading && !summary ? <Spinner /> : (summary?.projects ?? projects?.length ?? 0)}</span>
          <span>Projetos</span>
        </div>
        <div className="stat">
          <span className="stat-n">{summaryLoading && !summary ? <Spinner /> : (summary?.diagrams ?? 0)}</span>
          <span>Diagramas</span>
        </div>
        <div className="stat">
          <span className="stat-n">{summaryLoading && !summary ? <Spinner /> : (summary?.documents ?? 0)}</span>
          <span>Documentos escritos</span>
        </div>
      </section>

      <MigrationBanner />

      {empty && (
        <section className="empty-hero">
          <h2>Comece pelo primeiro projeto</h2>
          <p className="muted">
            Um projeto reúne diagramas, documentação e componentes reutilizáveis de um mesmo sistema. Para ver a ferramenta em ação,
            carregue um exemplo completo.
          </p>
          <div className="row">
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              <FilePlus2 size={15} />
              Criar projeto
            </button>
            <button className="btn" disabled={loadExample.loading} onClick={() => void openExample()}>
              <Sparkles size={15} />
              Carregar exemplo (E-commerce)
            </button>
          </div>
        </section>
      )}

      {projectsLoading && !projects && (
        <section>
          <h3 className="section-title">Projetos</h3>
          <CardSkeletonGrid count={3} />
        </section>
      )}

      {!!projects?.length && (
        <section>
          <div className="section-row">
            <h3 className="section-title">Projetos</h3>
            <Link to="/projects" className="link">
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card-grid">
            {projects.slice(0, 6).map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="card card-link">
                <div className="card-title">{p.name}</div>
                <p className="muted small clamp">{p.description || 'Sem descrição.'}</p>
                <StyleBadges styleIds={p.secondaryStyleIds} primary={p.primaryStyleId} />
                <div className="card-foot">
                  <span />
                  <span>{formatRelative(p.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentLoading && !recent && (
        <section>
          <h3 className="section-title">Diagramas recentes</h3>
          <CardSkeletonGrid count={3} />
        </section>
      )}

      {!!recent?.length && (
        <section>
          <h3 className="section-title">Diagramas recentes</h3>
          <div className="card-grid">
            {recent.map((d) => (
              <Link key={d.id} to={`/projects/${d.projectId}/diagrams/${d.id}`} className="card card-link">
                <div className="card-title">{d.name}</div>
                <div className="muted small">{projects?.find((p) => p.id === d.projectId)?.name}</div>
                <StyleBadges styleIds={d.styleIds} patternIds={d.patternIds} />
                <div className="card-foot">
                  <span>
                    {d.nodeCount} componentes · {d.connectionCount} conexões
                  </span>
                  <span>{formatRelative(d.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {creating && (
        <ProjectFormModal
          onClose={() => setCreating(false)}
          onSubmit={async (v) => {
            const p = await createProject.execute(v);
            nav(`/projects/${p.id}`);
          }}
        />
      )}
    </div>
  );
}
