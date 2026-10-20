import { Pause, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getIcon } from '@/components/ui/iconMap';
import { getCategory, getComponentType } from '@/data/componentCatalog';
import { DiagramStage, type StageEdge, type StageNode } from '../DiagramStage';
import { useInView, usePrefersReducedMotion } from '../hooks';

const W = 840;
const H = 400;

export const BUILD_NODES: StageNode[] = [
  { id: 'web', typeId: 'frontend-app', name: 'Web App', tech: 'React 19', desc: 'SPA do cliente final.', x: 0, y: 156, w: 160, h: 88 },
  { id: 'gw', typeId: 'api-gateway', name: 'API Gateway', tech: 'YARP', desc: 'Entrada única e autenticação.', x: 215, y: 156, w: 160, h: 88 },
  { id: 'orders', typeId: 'microservice', name: 'Order Service', tech: '.NET 8', desc: 'Ciclo de vida do pedido.', x: 450, y: 28, w: 180, h: 92 },
  { id: 'pay', typeId: 'microservice', name: 'Payment Service', tech: '.NET 8', desc: 'Cobrança e conciliação.', x: 450, y: 280, w: 180, h: 92 },
  { id: 'db', typeId: 'db-relational', name: 'Orders DB', tech: 'PostgreSQL 16', x: 690, y: 20, w: 150, h: 104 },
  { id: 'bus', typeId: 'message-broker', name: 'Event Bus', tech: 'RabbitMQ', x: 665, y: 300, w: 175, h: 64 },
];

export const BUILD_EDGES: StageEdge[] = [
  { id: 'e1', from: 'web', to: 'gw', kind: 'http', label: 'HTTPS' },
  { id: 'e2', from: 'gw', to: 'orders', kind: 'http', label: 'POST /orders' },
  { id: 'e3', from: 'gw', to: 'pay', kind: 'grpc' },
  { id: 'e4', from: 'orders', to: 'db', kind: 'db-access', label: 'EF Core' },
  { id: 'e5', from: 'orders', to: 'bus', kind: 'event-publish', label: 'OrderPlaced' },
  { id: 'e6', from: 'pay', to: 'bus', kind: 'event-subscribe' },
];

interface Step {
  title: string;
  text: string;
  add: string[];
  select?: string;
  pulse?: boolean;
}

const STEPS: Step[] = [
  { title: 'Canvas vazio', text: 'Comece em branco ou a partir de um template. Arraste componentes da biblioteca.', add: [] },
  { title: 'Adicione componentes', text: 'Cada tipo tem forma, ícone e categoria próprios — Web App e API Gateway entram no canvas.', add: ['web', 'gw'] },
  { title: 'Conecte', text: 'Conexões são semânticas: HTTP, gRPC, eventos, filas. O tipo define estilo e sincronia.', add: ['e1'] },
  { title: 'Monte os serviços', text: 'Microsserviços e rotas aparecem; gRPC é desenhado mais grosso que HTTP.', add: ['orders', 'pay', 'e2', 'e3'] },
  { title: 'Persistência', text: 'Bancos viram cilindros, com engine e schema como metadados.', add: ['db', 'e4'] },
  { title: 'Fluxo assíncrono', text: 'Publicar e assinar eventos usa linhas tracejadas e o selo async.', add: ['bus', 'e5', 'e6'] },
  { title: 'Edite propriedades', text: 'Selecione um nó para ver e ajustar nome, tecnologia, descrição e responsável.', add: [], select: 'orders' },
  { title: 'Siga o fluxo', text: 'Pacotes percorrem as conexões para mostrar como uma requisição atravessa a arquitetura.', add: [], select: 'orders', pulse: true },
];

const upTo = (i: number) => {
  const s = new Set<string>();
  STEPS.slice(0, i + 1).forEach((st) => st.add.forEach((id) => s.add(id)));
  return s;
};

const LIB = ['frontend-app', 'api-gateway', 'microservice', 'db-relational', 'message-broker'];
const LIB_NODE: Record<string, string[]> = {
  'frontend-app': ['web'],
  'api-gateway': ['gw'],
  microservice: ['orders', 'pay'],
  'db-relational': ['db'],
  'message-broker': ['bus'],
};

const OWNERS: Record<string, string> = { orders: 'Squad Pedidos', pay: 'Squad Pagamentos', web: 'Squad Web', gw: 'Plataforma', db: 'Plataforma', bus: 'Plataforma' };

export function BuildDemo() {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>();
  const [step, setStep] = useState(reduced ? STEPS.length - 1 : 0);
  const [playing, setPlaying] = useState(false);
  const [manual, setManual] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const current = STEPS[step];
  const base = useMemo(() => upTo(step), [step]);

  // nós vindos das etapas + os adicionados pela biblioteca; arestas só aparecem com os dois nós presentes
  const shown = useMemo(() => {
    const s = new Set([...base, ...manual]);
    BUILD_EDGES.forEach((e) => {
      const ends = s.has(e.from) && s.has(e.to);
      if (ends && (base.has(e.id) || manual.size)) s.add(e.id);
      else s.delete(e.id);
    });
    return s;
  }, [base, manual]);

  useEffect(() => {
    if (inView && !started && !reduced) {
      setStarted(true);
      setPlaying(true);
    }
  }, [inView, started, reduced]);

  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 900 : 1700);
    return () => clearTimeout(t);
  }, [playing, step]);

  useEffect(() => {
    if (current.select) setSelected(current.select);
    else if (step < 6) setSelected(null);
  }, [step, current.select]);

  const goTo = useCallback((i: number) => {
    setPlaying(false);
    setManual(new Set());
    setStep(i);
  }, []);

  const restart = () => {
    setManual(new Set());
    setSelected(null);
    setStep(0);
    setPlaying(!reduced);
  };

  const addFromLibrary = (typeId: string) => {
    setPlaying(false);
    const ids = LIB_NODE[typeId];
    const missing = ids.find((id) => !shown.has(id));
    setManual((m) => new Set([...m, ...(missing ? [missing] : [])]));
    if (missing) setSelected(missing);
  };

  const sel = BUILD_NODES.find((n) => n.id === selected && shown.has(n.id));
  const selDef = sel ? getComponentType(sel.typeId) : null;
  const SelIcon = selDef ? getIcon(selDef.icon) : null;
  const pulse = useMemo(() => (current.pulse && !reduced ? new Set(['e1', 'e2', 'e4', 'e5', 'e6']) : new Set<string>()), [current.pulse, reduced]);

  return (
    <div ref={ref} className="demo">
      <div className="demo-bar">
        <div className="demo-steps" role="tablist" aria-label="Etapas da demonstração">
          {STEPS.map((s, i) => (
            <button key={s.title} role="tab" aria-selected={i === step} className={`step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} onClick={() => goTo(i)} title={s.title}>
              <span>{i + 1}</span>
            </button>
          ))}
        </div>
        <div className="demo-ctrl">
          <button className="btn btn-sm" onClick={() => (playing ? setPlaying(false) : step >= STEPS.length - 1 ? restart() : setPlaying(true))}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
            {playing ? 'Pausar' : step >= STEPS.length - 1 ? 'Reproduzir de novo' : 'Continuar'}
          </button>
          <button className="btn btn-sm btn-ghost" onClick={restart} aria-label="Reiniciar demonstração">
            <RotateCcw size={13} /> Reiniciar
          </button>
        </div>
      </div>

      <div className="demo-window">
        <aside className="demo-lib" aria-label="Biblioteca de componentes">
          <div className="panel-title">Biblioteca</div>
          {LIB.map((id) => {
            const def = getComponentType(id);
            const Icon = getIcon(def.icon);
            const cat = getCategory(def.category);
            const all = LIB_NODE[id].every((n) => shown.has(n));
            return (
              <button key={id} className="lib-item demo-lib-item" style={{ ['--accent' as string]: cat.color }} onClick={() => addFromLibrary(id)} disabled={all} title={all ? 'Já adicionado' : 'Clique para adicionar ao canvas'}>
                <Icon size={15} />
                {def.label}
              </button>
            );
          })}
          <p className="demo-hint">Clique para adicionar — ou use as etapas.</p>
        </aside>

        <div className="demo-canvas">
          <DiagramStage width={W} height={H} nodes={BUILD_NODES} edges={BUILD_EDGES} shown={shown} selectedId={selected} onSelect={(id) => { setPlaying(false); setSelected(id); }} pulseEdges={pulse} label="Diagrama de exemplo: plataforma de e-commerce" />
          {shown.size === 0 && <div className="demo-empty">Arraste componentes para começar</div>}
        </div>

        <aside className="demo-props" aria-live="polite">
          <div className="panel-title">Propriedades</div>
          {sel && selDef && SelIcon ? (
            <div className="props-form demo-props-body" style={{ ['--accent' as string]: getCategory(selDef.category).color }} key={sel.id}>
              <div className="props-kicker">
                <SelIcon size={13} /> {selDef.label}
              </div>
              <div className="field">
                <span className="field-label">Nome</span>
                <div className="input demo-input">{sel.name}</div>
              </div>
              <div className="field">
                <span className="field-label">Tecnologia</span>
                <div className="input demo-input mono">{sel.tech ?? '—'}</div>
              </div>
              <div className="field">
                <span className="field-label">Descrição</span>
                <div className="input demo-input">{sel.desc ?? selDef.description}</div>
              </div>
              <div className="field">
                <span className="field-label">Time responsável</span>
                <div className="input demo-input">{OWNERS[sel.id]}</div>
              </div>
            </div>
          ) : (
            <p className="demo-hint pad">Selecione um componente no canvas para editar suas propriedades.</p>
          )}
        </aside>
      </div>

      <p className="demo-caption" role="status">
        <strong>{current.title}.</strong> {current.text}
      </p>
    </div>
  );
}
