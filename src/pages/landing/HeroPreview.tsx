import { useEffect, useMemo, useState } from 'react';
import { BUILD_EDGES, BUILD_NODES } from './demos/BuildDemo';
import { DiagramStage } from './DiagramStage';
import { usePrefersReducedMotion } from './hooks';

const ORDER = ['web', 'gw', 'e1', 'orders', 'pay', 'e2', 'e3', 'db', 'e4', 'bus', 'e5', 'e6'];
const PULSE = new Set(['e1', 'e2', 'e4', 'e5', 'e6']);

export function HeroPreview() {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(reduced ? ORDER.length : 0);

  useEffect(() => {
    if (reduced) {
      setN(ORDER.length);
      return;
    }
    const delay = n === 0 ? 900 : n >= ORDER.length ? 5200 : 520;
    const t = setTimeout(() => setN((c) => (c >= ORDER.length ? 0 : c + 1)), delay);
    return () => clearTimeout(t);
  }, [n, reduced]);

  const shown = useMemo(() => new Set(ORDER.slice(0, n)), [n]);
  const done = n >= ORDER.length;

  return (
    <div className="hero-window" role="img" aria-label="Prévia animada do editor: componentes de uma plataforma de e-commerce sendo conectados">
      <div className="hero-chrome">
        <span className="dots" aria-hidden>
          <i /> <i /> <i />
        </span>
        <span className="hero-title mono">Plataforma de E-commerce · Microsserviços</span>
        <span className={`save-status ${done ? 'saved' : 'saving'}`}>{done ? 'Salvo' : 'Salvando…'}</span>
      </div>
      <div className="hero-canvas" aria-hidden>
        <DiagramStage width={840} height={400} nodes={BUILD_NODES} edges={BUILD_EDGES} shown={shown} pulseEdges={done && !reduced ? PULSE : undefined} label="Prévia" minScale={0.42} />
      </div>
    </div>
  );
}
