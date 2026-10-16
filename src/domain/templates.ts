import { PATTERN_IDS, STYLE_IDS } from '@/data/architecture';
import type { ComponentProperties, ComponentTypeId, ConnectionKindId, DiagramEdge, DiagramLevel, DiagramNode } from '@/types';
import { createEdge, createNode } from './factories';
import { diagramReadme } from './docTemplates';

export type TemplateGroup = 'blank' | 'style' | 'pattern' | 'c4';

export interface TemplateBuild {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  readme: string;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  group: TemplateGroup;
  icon: string;
  description: string;
  level: DiagramLevel;
  styleIds: string[];
  patternIds: string[];
  build: () => TemplateBuild;
}

interface NodeOpts extends Partial<ComponentProperties> {
  w?: number;
  h?: number;
  z?: number;
}

function pickHandles(s: DiagramNode, t: DiagramNode): Pick<DiagramEdge, 'sourceHandle' | 'targetHandle'> {
  const sx = s.position.x + s.size.width / 2;
  const sy = s.position.y + s.size.height / 2;
  const tx = t.position.x + t.size.width / 2;
  const ty = t.position.y + t.size.height / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  if (Math.abs(dx) * 0.6 > Math.abs(dy)) {
    return dx > 0 ? { sourceHandle: 'right', targetHandle: 'left' } : { sourceHandle: 'left', targetHandle: 'right' };
  }
  return dy > 0 ? { sourceHandle: 'bottom', targetHandle: 'top' } : { sourceHandle: 'top', targetHandle: 'bottom' };
}

function builder() {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const byKey = new Map<string, DiagramNode>();
  return {
    node(key: string, type: ComponentTypeId, x: number, y: number, o: NodeOpts = {}) {
      const { w, h, z, ...props } = o;
      const n = createNode(type, { x, y }, props, { width: w, height: h }, z);
      byKey.set(key, n);
      nodes.push(n);
    },
    edge(from: string, to: string, kind: ConnectionKindId, o: Partial<DiagramEdge> = {}) {
      const s = byKey.get(from);
      const t = byKey.get(to);
      if (!s || !t) throw new Error(`template: chave inexistente ${from} -> ${to}`);
      edges.push(createEdge(s.id, t.id, kind, { ...pickHandles(s, t), ...o }));
    },
    done(readme: string): TemplateBuild {
      return { nodes, edges, readme };
    },
  };
}

const BOUNDARY_Z = 0;

const blank: DiagramTemplate = {
  id: 'blank',
  name: 'Canvas vazio',
  group: 'blank',
  icon: 'Square',
  description: 'Comece do zero, com total liberdade.',
  level: 'free',
  styleIds: [],
  patternIds: [],
  build: () => ({ nodes: [], edges: [], readme: '' }),
};

const monolith: DiagramTemplate = {
  id: 'style-monolith',
  name: 'Monolito',
  group: 'style',
  icon: 'Box',
  description: 'Uma única unidade de implantação com banco, cache e integrações.',
  level: 'container',
  styleIds: [STYLE_IDS.monolith],
  patternIds: [],
  build() {
    const b = builder();
    b.node('web', 'frontend-app', 0, 150, { name: 'Web App', technology: 'React' });
    b.node('lb', 'load-balancer', 260, 160, { w: 160, h: 70 });
    b.node('mono', 'monolith', 520, 130, {
      name: 'Aplicação Monolítica',
      technology: '.NET',
      responsibility: 'Toda a lógica de negócio em um único deployable.',
      w: 260,
      h: 120,
    });
    b.node('db', 'db-relational', 560, 330, { name: 'PostgreSQL', technology: 'PostgreSQL' });
    b.node('cache', 'cache', 800, 330, { name: 'Redis', technology: 'Redis' });
    b.node('ext', 'external-service', 900, 150, { name: 'Gateway de Pagamento' });
    b.edge('web', 'lb', 'http');
    b.edge('lb', 'mono', 'http');
    b.edge('mono', 'db', 'db-access');
    b.edge('mono', 'cache', 'db-access', { protocol: 'RESP' });
    b.edge('mono', 'ext', 'http');
    return b.done(diagramReadme('Arquitetura Monolítica', 'Uma única unidade de implantação concentra todas as funcionalidades.'));
  },
};

const modularMonolith: DiagramTemplate = {
  id: 'style-modular-monolith',
  name: 'Monolito Modular',
  group: 'style',
  icon: 'Puzzle',
  description: 'Módulos com fronteiras claras dentro de uma única implantação.',
  level: 'container',
  styleIds: [STYLE_IDS.modularMonolith],
  patternIds: [],
  build() {
    const b = builder();
    b.node('web', 'frontend-app', 0, 200, { name: 'Web App' });
    b.node('host', 'boundary', 260, 0, { name: 'Monolito Modular (1 deployment)', w: 640, h: 480, z: BOUNDARY_Z });
    b.node('api', 'api-rest', 300, 50, { name: 'API Host', responsibility: 'Composição e roteamento para módulos.', w: 560, h: 70 });
    b.node('orders', 'module', 300, 170, { name: 'Módulo Pedidos', responsibility: 'Ciclo de vida de pedidos.', w: 170, h: 90 });
    b.node('catalog', 'module', 490, 170, { name: 'Módulo Catálogo', responsibility: 'Produtos e preços.', w: 170, h: 90 });
    b.node('payments', 'module', 680, 170, { name: 'Módulo Pagamentos', responsibility: 'Cobrança e conciliação.', w: 170, h: 90 });
    b.node('identity', 'module', 395, 320, { name: 'Módulo Identidade', responsibility: 'Usuários e acesso.', w: 170, h: 90 });
    b.node('db', 'db-relational', 395, 540, { name: 'PostgreSQL (schema por módulo)', w: 280, h: 100 });
    b.edge('web', 'api', 'http');
    b.edge('api', 'orders', 'internal');
    b.edge('api', 'catalog', 'internal');
    b.edge('api', 'payments', 'internal');
    b.edge('orders', 'catalog', 'internal', { label: 'contrato público' });
    b.edge('orders', 'payments', 'internal', { label: 'contrato público' });
    b.edge('orders', 'db', 'db-access');
    b.edge('catalog', 'db', 'db-access');
    b.edge('payments', 'db', 'db-access');
    b.edge('identity', 'db', 'db-access');
    return b.done(diagramReadme('Monolito Modular', 'Módulos isolados por contratos públicos, implantados juntos.'));
  },
};

const microservices: DiagramTemplate = {
  id: 'style-microservices',
  name: 'Microsserviços',
  group: 'style',
  icon: 'Boxes',
  description: 'Serviços independentes por API Gateway, cada um com seu banco.',
  level: 'container',
  styleIds: [STYLE_IDS.microservices],
  patternIds: [],
  build() {
    const b = builder();
    b.node('web', 'frontend-app', 0, 190, { name: 'Web App' });
    b.node('gw', 'api-gateway', 260, 190, { name: 'API Gateway', w: 180, h: 80 });
    b.node('order', 'microservice', 560, 20, {
      name: 'Order Service',
      technology: '.NET',
      metadata: { database: 'PostgreSQL', communication: 'REST / RabbitMQ' },
    });
    b.node('payment', 'microservice', 560, 190, {
      name: 'Payment Service',
      technology: '.NET',
      metadata: { database: 'PostgreSQL', communication: 'gRPC' },
    });
    b.node('catalog', 'microservice', 560, 360, {
      name: 'Catalog Service',
      technology: 'Node.js',
      metadata: { database: 'MongoDB', communication: 'REST' },
    });
    b.node('orderdb', 'db-relational', 880, 20, { name: 'Orders DB', w: 140, h: 90 });
    b.node('paymentdb', 'db-relational', 880, 190, { name: 'Payments DB', w: 140, h: 90 });
    b.node('catalogdb', 'db-nosql', 880, 360, { name: 'Catalog DB', w: 140, h: 90 });
    b.edge('web', 'gw', 'http');
    b.edge('gw', 'order', 'http');
    b.edge('gw', 'payment', 'http');
    b.edge('gw', 'catalog', 'http');
    b.edge('order', 'payment', 'grpc', { label: 'cobrar pedido' });
    b.edge('order', 'orderdb', 'db-access');
    b.edge('catalog', 'catalogdb', 'db-access');
    b.edge('payment', 'paymentdb', 'db-access');
    return b.done(diagramReadme('Arquitetura de Microsserviços', 'Serviços independentes, cada um dono dos seus dados.'));
  },
};

const eventDriven: DiagramTemplate = {
  id: 'style-event-driven',
  name: 'Orientada a Eventos',
  group: 'style',
  icon: 'Radio',
  description: 'Produtores, event bus, tópicos e consumidores desacoplados.',
  level: 'container',
  styleIds: [STYLE_IDS.eventDriven],
  patternIds: [],
  build() {
    const b = builder();
    b.node('order', 'producer', 0, 40, { name: 'Order Service', metadata: { emits: 'OrderCreated' } });
    b.node('payment', 'producer', 0, 260, { name: 'Payment Service', metadata: { emits: 'PaymentApproved' } });
    b.node('bus', 'event-bus', 340, 150, { name: 'Event Bus', w: 240, h: 80 });
    b.node('t1', 'topic', 340, 0, { name: 'order.created' });
    b.node('t2', 'topic', 340, 330, { name: 'payment.approved' });
    b.node('inv', 'consumer', 720, 0, { name: 'Inventory Service', metadata: { consumes: 'OrderCreated' } });
    b.node('notif', 'consumer', 720, 140, { name: 'Notification Worker', metadata: { consumes: 'PaymentApproved' } });
    b.node('dw', 'data-warehouse', 740, 300, { name: 'Analytics DW' });
    b.edge('order', 't1', 'event-publish');
    b.edge('payment', 't2', 'event-publish');
    b.edge('t1', 'bus', 'event-publish');
    b.edge('t2', 'bus', 'event-publish');
    b.edge('bus', 'inv', 'event-subscribe', { label: 'OrderCreated' });
    b.edge('bus', 'notif', 'event-subscribe', { label: 'PaymentApproved' });
    b.edge('bus', 'dw', 'event-subscribe', { label: '*' });
    return b.done(diagramReadme('Arquitetura Orientada a Eventos', 'Componentes desacoplados comunicando-se por eventos.'));
  },
};

const clean: DiagramTemplate = {
  id: 'pattern-clean',
  name: 'Clean Architecture',
  group: 'pattern',
  icon: 'Target',
  description: 'Domain, Application, Infrastructure e Presentation; dependências para dentro.',
  level: 'component',
  styleIds: [],
  patternIds: [PATTERN_IDS.clean],
  build() {
    const b = builder();
    b.node('presentation', 'boundary', 0, 0, { name: 'Presentation', w: 300, h: 300, z: BOUNDARY_Z });
    b.node('application', 'boundary', 420, 0, { name: 'Application', w: 300, h: 300, z: BOUNDARY_Z });
    b.node('domain', 'boundary', 840, 0, { name: 'Domain', w: 300, h: 300, z: BOUNDARY_Z });
    b.node('infra', 'boundary', 420, 440, { name: 'Infrastructure', w: 720, h: 260, z: BOUNDARY_Z });
    b.node('ctrl', 'controller', 65, 70, { name: 'OrdersController' });
    b.node('dto', 'presentation', 65, 180, { name: 'Request / Response DTOs', w: 170, h: 70 });
    b.node('uc', 'use-case', 485, 70, { name: 'CreateOrderUseCase' });
    b.node('port', 'repository', 485, 180, { name: 'IOrderRepository (porta)' });
    b.node('agg', 'aggregate', 905, 70, { name: 'Order (Aggregate Root)' });
    b.node('evt', 'domain-event', 905, 180, { name: 'OrderCreated' });
    b.node('repo', 'repository', 470, 520, { name: 'OrderRepository (adapter)', w: 190, h: 70 });
    b.node('db', 'db-relational', 740, 520, { name: 'PostgreSQL', w: 140, h: 90 });
    b.node('bus', 'message-broker', 940, 540, { name: 'RabbitMQ', w: 170, h: 60 });
    b.node('note', 'note', 0, 380, {
      name: 'Regra de dependência',
      description:
        'Dependências de código apontam sempre para dentro: Presentation → Application → Domain. Infrastructure implementa as portas definidas em Application.',
      w: 340,
      h: 150,
    });
    b.edge('ctrl', 'uc', 'dependency', { label: 'chama' });
    b.edge('uc', 'agg', 'dependency', { label: 'usa' });
    b.edge('uc', 'port', 'dependency', { label: 'depende de' });
    b.edge('repo', 'port', 'dependency', { label: 'implementa' });
    b.edge('repo', 'db', 'db-access');
    b.edge('agg', 'evt', 'dependency', { label: 'emite' });
    b.edge('bus', 'evt', 'dependency', { label: 'publica' });
    return b.done(
      diagramReadme('Clean Architecture', 'Separação de responsabilidades com a regra de dependência apontando para o domínio.'),
    );
  },
};

const verticalSlice: DiagramTemplate = {
  id: 'pattern-vertical-slice',
  name: 'Vertical Slice',
  group: 'pattern',
  icon: 'PanelTop',
  description: 'Features com commands, queries, handlers e validators.',
  level: 'component',
  styleIds: [],
  patternIds: [PATTERN_IDS.verticalSlice],
  build() {
    const b = builder();
    b.node('f1', 'boundary', 0, 0, { name: 'Feature: CreateOrder', w: 560, h: 200, z: BOUNDARY_Z });
    b.node('f2', 'boundary', 0, 240, { name: 'Feature: GetOrderById', w: 560, h: 200, z: BOUNDARY_Z });
    b.node('f3', 'boundary', 0, 480, { name: 'Feature: CancelOrder', w: 560, h: 200, z: BOUNDARY_Z });
    b.node('c1', 'command', 30, 70, { name: 'CreateOrderCommand', w: 150, h: 62 });
    b.node('v1', 'validator', 200, 70, { name: 'CreateOrderValidator', w: 150, h: 62 });
    b.node('h1', 'handler', 370, 70, { name: 'CreateOrderHandler', w: 160, h: 62 });
    b.node('q2', 'query', 30, 310, { name: 'GetOrderByIdQuery', w: 150, h: 62 });
    b.node('h2', 'handler', 370, 310, { name: 'GetOrderByIdHandler', w: 160, h: 62 });
    b.node('c3', 'command', 30, 550, { name: 'CancelOrderCommand', w: 150, h: 62 });
    b.node('v3', 'validator', 200, 550, { name: 'CancelOrderValidator', w: 150, h: 62 });
    b.node('h3', 'handler', 370, 550, { name: 'CancelOrderHandler', w: 160, h: 62 });
    b.node('shared', 'boundary', 700, 0, { name: 'Shared / Infrastructure', w: 320, h: 680, z: BOUNDARY_Z });
    b.node('db', 'db-relational', 780, 200, { name: 'Database', w: 160, h: 100 });
    b.node('mediator', 'application', 760, 70, { name: 'Mediator / Pipeline', w: 200, h: 70 });
    b.edge('c1', 'v1', 'internal', { label: 'valida' });
    b.edge('v1', 'h1', 'internal');
    b.edge('q2', 'h2', 'internal');
    b.edge('c3', 'v3', 'internal', { label: 'valida' });
    b.edge('v3', 'h3', 'internal');
    b.edge('h1', 'db', 'db-access');
    b.edge('h2', 'db', 'db-access');
    b.edge('h3', 'db', 'db-access');
    return b.done(
      diagramReadme('Vertical Slice Architecture', 'Cada fatia contém tudo para entregar um caso de uso, do endpoint ao dado.'),
    );
  },
};

const layered: DiagramTemplate = {
  id: 'pattern-layered',
  name: 'Layered Architecture',
  group: 'pattern',
  icon: 'Layers',
  description: 'Presentation, Business/Application, Data Access e Infrastructure.',
  level: 'component',
  styleIds: [],
  patternIds: [PATTERN_IDS.layered],
  build() {
    const b = builder();
    b.node('l1', 'boundary', 0, 0, { name: 'Presentation Layer', w: 640, h: 160, z: BOUNDARY_Z });
    b.node('l2', 'boundary', 0, 220, { name: 'Business / Application Layer', w: 640, h: 160, z: BOUNDARY_Z });
    b.node('l3', 'boundary', 0, 440, { name: 'Data Access Layer', w: 640, h: 160, z: BOUNDARY_Z });
    b.node('l4', 'boundary', 0, 660, { name: 'Infrastructure Layer', w: 640, h: 160, z: BOUNDARY_Z });
    b.node('ctrl', 'controller', 40, 60, { name: 'Controllers' });
    b.node('views', 'frontend-app', 260, 60, { name: 'Views / UI', h: 70 });
    b.node('svc', 'application', 40, 280, { name: 'Application Services' });
    b.node('dom', 'domain', 260, 280, { name: 'Domain Model' });
    b.node('repo', 'repository', 40, 500, { name: 'Repositories' });
    b.node('orm', 'infrastructure', 260, 500, { name: 'ORM / Data Mapper' });
    b.node('db', 'db-relational', 40, 720, { name: 'Database', w: 140, h: 90 });
    b.node('ext', 'external-service', 260, 730, { name: 'Serviços Externos', h: 70 });
    b.edge('ctrl', 'svc', 'dependency');
    b.edge('svc', 'repo', 'dependency');
    b.edge('repo', 'db', 'db-access');
    b.edge('svc', 'ext', 'http');
    return b.done(diagramReadme('Layered Architecture', 'Cada camada depende somente da camada imediatamente inferior.'));
  },
};

const c4Context: DiagramTemplate = {
  id: 'c4-context',
  name: 'C4 · System Context',
  group: 'c4',
  icon: 'Orbit',
  description: 'O sistema, seus usuários e os sistemas externos com que se integra.',
  level: 'context',
  styleIds: [],
  patternIds: [],
  build() {
    const b = builder();
    b.node('customer', 'person', 0, 120, { name: 'Cliente', description: 'Compra produtos pela web.' });
    b.node('admin', 'person', 0, 300, { name: 'Operador', description: 'Gerencia catálogo e pedidos.' });
    b.node('system', 'software-system', 330, 190, { name: 'Plataforma', description: 'Sistema em modelagem.', w: 240, h: 110 });
    b.node('pay', 'external-service', 720, 90, { name: 'Gateway de Pagamento' });
    b.node('mail', 'external-service', 720, 290, { name: 'Serviço de E-mail' });
    b.edge('customer', 'system', 'http', { label: 'usa' });
    b.edge('admin', 'system', 'http', { label: 'administra' });
    b.edge('system', 'pay', 'http', { label: 'cobra' });
    b.edge('system', 'mail', 'http', { label: 'envia e-mails' });
    return b.done(diagramReadme('System Context', 'Visão de mais alto nível: o sistema e seu entorno.'));
  },
};

const c4Container: DiagramTemplate = {
  id: 'c4-container',
  name: 'C4 · Container',
  group: 'c4',
  icon: 'Container',
  description: 'Aplicações, serviços e armazenamentos que compõem o sistema.',
  level: 'container',
  styleIds: [],
  patternIds: [],
  build() {
    const b = builder();
    b.node('customer', 'person', 0, 160, { name: 'Cliente' });
    b.node('sys', 'boundary', 260, 0, { name: 'Plataforma', w: 640, h: 420, z: BOUNDARY_Z });
    b.node('web', 'frontend-app', 300, 70, { name: 'Web App' });
    b.node('api', 'api-rest', 560, 70, { name: 'API' });
    b.node('worker', 'worker', 560, 230, { name: 'Worker' });
    b.node('db', 'db-relational', 320, 250, { name: 'Banco de Dados', w: 150, h: 100 });
    b.node('ext', 'external-service', 960, 80, { name: 'Gateway de Pagamento' });
    b.edge('customer', 'web', 'http');
    b.edge('web', 'api', 'http');
    b.edge('api', 'db', 'db-access');
    b.edge('api', 'worker', 'queue-producer');
    b.edge('worker', 'ext', 'http');
    return b.done(diagramReadme('Container Diagram', 'Unidades executáveis e armazenamentos do sistema.'));
  },
};

const c4Component: DiagramTemplate = {
  id: 'c4-component',
  name: 'C4 · Component',
  group: 'c4',
  icon: 'Component',
  description: 'Componentes internos de um container.',
  level: 'component',
  styleIds: [],
  patternIds: [],
  build() {
    const b = builder();
    b.node('box', 'boundary', 0, 0, { name: 'Order Service', w: 760, h: 260, z: BOUNDARY_Z });
    b.node('ctrl', 'controller', 30, 90, { name: 'OrdersController' });
    b.node('svc', 'use-case', 270, 90, { name: 'OrderService' });
    b.node('repo', 'repository', 510, 90, { name: 'OrderRepository' });
    b.node('db', 'db-relational', 540, 340, { name: 'Orders DB', w: 150, h: 90 });
    b.edge('ctrl', 'svc', 'internal');
    b.edge('svc', 'repo', 'internal');
    b.edge('repo', 'db', 'db-access');
    return b.done(diagramReadme('Component Diagram', 'Componentes internos de um container.'));
  },
};

export const TEMPLATES: DiagramTemplate[] = [
  blank,
  monolith,
  modularMonolith,
  microservices,
  eventDriven,
  clean,
  verticalSlice,
  layered,
  c4Context,
  c4Container,
  c4Component,
];

export const TEMPLATE_GROUPS: { id: TemplateGroup; label: string }[] = [
  { id: 'blank', label: 'Começar do zero' },
  { id: 'style', label: 'Estilos arquiteturais' },
  { id: 'pattern', label: 'Padrões arquiteturais' },
  { id: 'c4', label: 'Níveis (referência C4)' },
];

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id) ?? blank;

export const LEVELS: { id: DiagramLevel; label: string }[] = [
  { id: 'free', label: 'Livre' },
  { id: 'context', label: 'System Context' },
  { id: 'container', label: 'Container' },
  { id: 'component', label: 'Component' },
];
