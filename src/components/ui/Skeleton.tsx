import type { CSSProperties } from 'react';

export function Skeleton({
  width = '100%',
  height = 14,
  style,
}: {
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
}) {
  return <span className="skeleton" aria-hidden style={{ width, height, ...style }} />;
}

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

function HeadSkeleton({ actions = 2 }: { actions?: number }) {
  return (
    <header className="page-head" aria-hidden>
      <div>
        <Skeleton width={240} height={26} />
        <Skeleton width={360} height={13} style={{ marginTop: 6 }} />
      </div>
      <div className="row">
        {Array.from({ length: actions }, (_, i) => (
          <Skeleton key={i} width={96} height={32} />
        ))}
      </div>
    </header>
  );
}

/** Skeleton de página genérica (cabeçalho + lista). */
export function PageSkeleton({ variant = 'list', nested = false }: { variant?: 'list' | 'cards' | 'form'; nested?: boolean }) {
  return (
    <div className="page" {...(nested ? {} : { role: 'status', 'aria-busy': true, 'aria-label': 'Carregando' })}>
      <HeadSkeleton />
      {variant === 'cards' && <CardSkeletonGrid count={6} />}
      {variant === 'list' && <ListSkeleton count={5} />}
      {variant === 'form' && (
        <div className="card" style={{ gap: 14 }}>
          <Skeleton width="30%" height={16} />
          <Skeleton height={36} />
          <Skeleton height={36} />
          <Skeleton width={120} height={32} />
        </div>
      )}
    </div>
  );
}

/** Skeleton da página de projeto: breadcrumb, cabeçalho e lista de diagramas. */
export function ProjectPageSkeleton() {
  return (
    <div className="page" role="status" aria-busy="true" aria-label="Carregando projeto">
      <Skeleton width={180} height={12} />
      <HeadSkeleton actions={3} />
      <Skeleton width={280} height={32} />
      <CardSkeletonGrid count={6} />
    </div>
  );
}

/** Skeleton do editor: cabeçalho, biblioteca, canvas e propriedades. */
export function EditorSkeleton() {
  return (
    <div className="editor" role="status" aria-busy="true" aria-label="Carregando diagrama">
      <header className="ed-head" aria-hidden>
        <Skeleton width={28} height={28} />
        <Skeleton width={260} height={16} />
        <div className="tb-spacer" />
        <Skeleton width={90} height={28} />
        <Skeleton width={90} height={28} />
      </header>
      <div className="toolbar" aria-hidden>
        <Skeleton width={320} height={28} />
        <Skeleton width={160} height={28} />
      </div>
      <div className="ed-body">
        <aside className="library" aria-hidden>
          <div className="panel-title">
            <Skeleton width={80} height={11} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 14px' }}>
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} height={30} />
            ))}
          </div>
        </aside>
        <div className="ed-center">
          <div className="ed-canvas" aria-hidden>
            <div className="skeleton-canvas">
              <Skeleton width={170} height={70} style={{ top: '22%', left: '16%' }} />
              <Skeleton width={170} height={70} style={{ top: '22%', left: '46%' }} />
              <Skeleton width={170} height={70} style={{ top: '55%', left: '31%' }} />
              <Skeleton width={170} height={70} style={{ top: '55%', left: '60%' }} />
            </div>
          </div>
        </div>
        <aside className="props" aria-hidden>
          <div className="panel-title">
            <Skeleton width={90} height={11} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 14px' }}>
            <Skeleton height={34} />
            <Skeleton height={34} />
            <Skeleton height={70} />
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Skeleton do app inteiro (restauração de sessão): sidebar + página. */
export function AppSkeleton() {
  return (
    <div className="shell" role="status" aria-busy="true" aria-label="Carregando">
      <aside className="sidebar" aria-hidden>
        <Skeleton width={120} height={22} style={{ margin: '4px 8px 16px' }} />
        <Skeleton height={32} />
        <Skeleton height={32} style={{ marginTop: 4 }} />
        <Skeleton width={110} height={11} style={{ margin: '22px 8px 8px' }} />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} height={34} style={{ marginTop: 4 }} />
        ))}
      </aside>
      <main className="main">
        <PageSkeleton variant="cards" nested />
      </main>
    </div>
  );
}

/** Skeleton das telas públicas (login/cadastro), centralizado. */
export function AuthSkeleton() {
  return (
    <div className="auth-skeleton" role="status" aria-busy="true" aria-label="Carregando">
      <div className="card" style={{ width: 'min(400px, 100%)', gap: 14 }}>
        <Skeleton width={140} height={22} />
        <Skeleton width="70%" height={12} />
        <Skeleton height={38} style={{ marginTop: 8 }} />
        <Skeleton height={38} />
        <Skeleton height={40} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

export function PageLoading({ className = 'page' }: { className?: string }) {
  return (
    <div className={`${className} loading`}>
      <Spinner />
    </div>
  );
}

export function CardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="card-grid" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
          <Skeleton width="50%" height={18} style={{ marginTop: 4 }} />
          <div className="card-foot">
            <Skeleton width="45%" height={11} />
            <Skeleton width="20%" height={11} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="list" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="list-row">
          <div className="list-main">
            <Skeleton width="30%" height={16} />
            <Skeleton width="55%" height={12} />
            <Skeleton width={90} height={18} style={{ marginTop: 4 }} />
          </div>
          <div className="list-meta">
            <Skeleton width={150} height={12} style={{ marginBottom: 6 }} />
            <Skeleton width={150} height={12} />
          </div>
          <Skeleton width={80} height={28} />
        </div>
      ))}
    </div>
  );
}
