import { ChevronRight, MousePointerClick } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DiagramStage, type StageEdge, type StageNode } from '../DiagramStage';

interface Diagram {
  id: string;
  title: string;
  level: string;
  blurb: string;
  nodes: StageNode[];
  edges: StageEdge[];
  links: Record<string, string>;
}

const DIAGRAMS: Record<string, Diagram> = {
  context: {
    id: 'context',
    title: 'Contexto do sistema',
    level: 'C4 · Contexto',
    blurb: 'Quem usa o sistema e com o que ele se integra.',
    nodes: [
      { id: 'cli', typeId: 'person', name: 'Cliente', desc: 'Compra pela web.', x: 20, y: 140, w: 170, h: 90 },
      { id: 'sys', typeId: 'software-system', name: 'Plataforma de E-commerce', desc: 'Catálogo, pedidos e pagamentos.', x: 340, y: 130, w: 220, h: 110, link: true },
      { id: 'psp', typeId: 'external-service', name: 'Gateway de Pagamento', tech: 'Stripe', x: 670, y: 60, w: 160, h: 84 },
      { id: 'mail', typeId: 'external-service', name: 'Serviço de E-mail', tech: 'Brevo', x: 670, y: 230, w: 160, h: 84 },
    ],
    edges: [
      { id: 'a', from: 'cli', to: 'sys', kind: 'http', label: 'compra' },
      { id: 'b', from: 'sys', to: 'psp', kind: 'http', label: 'cobra' },
      { id: 'c', from: 'sys', to: 'mail', kind: 'http', label: 'notifica' },
    ],
    links: { sys: 'containers' },
  },
  containers: {
    id: 'containers',
    title: 'Microsserviços',
    level: 'C4 · Contêineres',
    blurb: 'Os serviços que compõem o sistema, cada um com seu padrão interno.',
    nodes: [
      { id: 'gw', typeId: 'api-gateway', name: 'API Gateway', tech: 'YARP', x: 0, y: 150, w: 160, h: 84 },
      { id: 'ord', typeId: 'microservice', name: 'Order Service', tech: '.NET 8', desc: 'Ciclo de vida do pedido.', tag: 'Clean', link: true, x: 270, y: 30, w: 190, h: 100 },
      { id: 'cat', typeId: 'microservice', name: 'Catalog Service', tech: '.NET 8', desc: 'Produtos e preços.', tag: 'Layered', x: 270, y: 255, w: 190, h: 100 },
      { id: 'pay', typeId: 'microservice', name: 'Payment Service', tech: '.NET 8', desc: 'Cobrança e conciliação.', tag: 'Vertical Slice', x: 600, y: 30, w: 220, h: 100 },
      { id: 'bus', typeId: 'message-broker', name: 'Event Bus', tech: 'RabbitMQ', x: 600, y: 270, w: 220, h: 70 },
    ],
    edges: [
      { id: 'a', from: 'gw', to: 'ord', kind: 'http' },
      { id: 'b', from: 'gw', to: 'cat', kind: 'grpc' },
      { id: 'c', from: 'ord', to: 'bus', kind: 'event-publish', label: 'OrderPlaced' },
      { id: 'd', from: 'pay', to: 'bus', kind: 'event-subscribe' },
    ],
    links: { ord: 'order' },
  },
  order: {
    id: 'order',
    title: 'Order Service · Arquitetura interna',
    level: 'Clean Architecture',
    blurb: 'Dependências apontam para o domínio; cada camada é um componente.',
    nodes: [
      { id: 'ctl', typeId: 'controller', name: 'OrdersController', desc: 'Camada Presentation.', x: 0, y: 150, w: 170, h: 84 },
      { id: 'uc', typeId: 'use-case', name: 'PlaceOrder', desc: 'Camada Application.', x: 230, y: 150, w: 170, h: 84 },
      { id: 'agg', typeId: 'aggregate-root', name: 'Order', desc: 'Camada Domain.', x: 460, y: 40, w: 170, h: 84 },
      { id: 'repo', typeId: 'repository', name: 'OrderRepository', desc: 'Camada Infrastructure.', x: 460, y: 260, w: 170, h: 84 },
      { id: 'db', typeId: 'db-relational', name: 'Orders DB', tech: 'PostgreSQL', x: 690, y: 238, w: 140, h: 110 },
    ],
    edges: [
      { id: 'a', from: 'ctl', to: 'uc', kind: 'dependency' },
      { id: 'b', from: 'uc', to: 'agg', kind: 'dependency' },
      { id: 'c', from: 'uc', to: 'repo', kind: 'dependency' },
      { id: 'd', from: 'repo', to: 'db', kind: 'db-access' },
    ],
    links: {},
  },
};

const W = 840;
const H = 380;

export function DrillDemo() {
  const [trail, setTrail] = useState<string[]>(['context']);
  const [dir, setDir] = useState<'in' | 'out'>('in');
  const [selected, setSelected] = useState<string | null>(null);
  const current = DIAGRAMS[trail[trail.length - 1]];
  const all = useMemo(() => new Set([...current.nodes.map((n) => n.id), ...current.edges.map((e) => e.id)]), [current]);

  const open = (id: string) => {
    const target = current.links[id];
    if (target) {
      setDir('in');
      setSelected(null);
      setTrail((t) => [...t, target]);
    } else setSelected(id);
  };
  const goTo = (i: number) => {
    if (i === trail.length - 1) return;
    setDir('out');
    setSelected(null);
    setTrail((t) => t.slice(0, i + 1));
  };
  const hasLinks = Object.keys(current.links).length > 0;
  const sel = current.nodes.find((n) => n.id === selected);

  return (
    <div className="demo">
      <div className="demo-bar">
        <nav className="demo-crumbs" aria-label="Navegação entre diagramas">
          {trail.map((id, i) => (
            <span key={id} className="crumb">
              {i > 0 && <ChevronRight size={13} aria-hidden />}
              <button className={i === trail.length - 1 ? 'on' : ''} onClick={() => goTo(i)} aria-current={i === trail.length - 1 ? 'page' : undefined}>
                {DIAGRAMS[id].title}
              </button>
            </span>
          ))}
        </nav>
        <span className="badge">{current.level}</span>
      </div>

      <div className="demo-window single">
        <div className={`demo-canvas drill ${dir}`} key={current.id}>
          <DiagramStage
            width={W}
            height={H}
            nodes={current.nodes}
            edges={current.edges}
            shown={all}
            selectedId={selected}
            onSelect={open}
            label={`Diagrama: ${current.title}`}
          />
        </div>
      </div>

      <p className="demo-caption" role="status">
        {current.blurb}{' '}
        {hasLinks ? (
          <span className="demo-cta">
            <MousePointerClick size={14} aria-hidden /> Clique no componente com selo <code>detalhe</code> para abrir o diagrama dele.
          </span>
        ) : sel ? (
          <span>
            <strong>{sel.name}</strong> — {sel.desc}
          </span>
        ) : (
          <span>Chegou ao nível mais detalhado. Use o caminho acima para voltar.</span>
        )}
      </p>
    </div>
  );
}
