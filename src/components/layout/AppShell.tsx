import { FolderKanban, LayoutDashboard, Settings, Workflow } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { UserMenu } from '@/components/layout/UserMenu';
import { useProjects } from '@/hooks/useProjects';
import { useRecentDiagrams } from '@/hooks/useRecentDiagrams';
import { formatRelative } from '@/utils/format';

export function AppShell() {
  const { recent } = useRecentDiagrams(6);
  const { projects } = useProjects();
  const nameOf = (id: string) => projects?.find((p) => p.id === id)?.name ?? '';

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
            <rect x="4" y="4" width="10" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <rect x="18" y="20" width="10" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="M9 12v4h14v4" fill="none" stroke="currentColor" strokeWidth="2.2" />
          </svg>
          <span>archdraw</span>
        </div>
        <nav className="nav">
          <NavLink to="/" end>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/projects">
            <FolderKanban size={16} />
            Projetos
          </NavLink>
        </nav>
        <div className="side-section">
          <div className="side-title">Diagramas recentes</div>
          {recent?.length ? (
            recent.map((d) => (
              <NavLink key={d.id} className="recent" to={`/projects/${d.projectId}/diagrams/${d.id}`}>
                <Workflow size={14} />
                <span className="recent-text">
                  <span>{d.name}</span>
                  <small>
                    {nameOf(d.projectId)} · {formatRelative(d.updatedAt)}
                  </small>
                </span>
              </NavLink>
            ))
          ) : (
            <p className="side-empty">Nenhum diagrama ainda.</p>
          )}
        </div>
        <nav className="nav nav-bottom">
          <NavLink to="/settings">
            <Settings size={16} />
            Configurações
          </NavLink>
        </nav>
        <UserMenu />
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
