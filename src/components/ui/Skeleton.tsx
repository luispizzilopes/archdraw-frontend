import type { CSSProperties } from 'react';

export function Skeleton({ width = '100%', height = 14, style }: { width?: number | string; height?: number | string; style?: CSSProperties }) {
  return <span className="skeleton" aria-hidden style={{ width, height, ...style }} />;
}

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />;
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
