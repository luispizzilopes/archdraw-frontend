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
    b.node('host', 'boundary', 260, 0, { name: 'Monolito Modular (1 deployment)', w: 820, h: 480, z: BOUNDARY_Z });
    b.node('api', 'api-rest', 300, 50, { name: 'API Host', responsibility: 'Composição e roteamento para módulos.', w: 760, h: 70 });
    b.node('orders', 'module', 300, 210, { name: 'Módulo Pedidos', responsibility: 'Ciclo de vida de pedidos.', w: 170, h: 90 });
    b.node('catalog', 'module', 590, 210, { name: 'Módulo Catálogo', responsibility: 'Produtos e preços.', w: 170, h: 90 });
    b.node('payments', 'module', 880, 210, { name: 'Módulo Pagamentos', responsibility: 'Cobrança e conciliação.', w: 170, h: 90 });
    b.node('identity', 'module', 590, 370, { name: 'Módulo Identidade', responsibility: 'Usuários e acesso.', w: 170, h: 90 });
    b.node('db', 'db-relational', 535, 570, { name: 'PostgreSQL (schema por módulo)', w: 280, h: 100 });
    b.edge('web', 'api', 'http');
    b.edge('api', 'orders', 'internal');
    b.edge('api', 'catalog', 'internal');
    b.edge('api', 'payments', 'internal');
    b.edge('orders', 'catalog', 'internal', { label: 'contrato público' });
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
    b.node('web', 'frontend-app', 0, 230, { name: 'Web App' });
    b.node('gw', 'api-gateway', 260, 230, { name: 'API Gateway', w: 180, h: 80 });
    b.node('order', 'microservice', 560, 20, {
      name: 'Order Service',
      technology: '.NET',
      metadata: { database: 'PostgreSQL', communication: 'REST / RabbitMQ' },
    });
    b.node('payment', 'microservice', 560, 230, {
      name: 'Payment Service',
      technology: '.NET',
      metadata: { database: 'PostgreSQL', communication: 'gRPC' },
    });
    b.node('catalog', 'microservice', 560, 440, {
      name: 'Catalog Service',
      technology: 'Node.js',
      metadata: { database: 'MongoDB', communication: 'REST' },
    });
    b.node('orderdb', 'db-relational', 880, 20, { name: 'Orders DB', w: 140, h: 90 });
    b.node('paymentdb', 'db-relational', 880, 230, { name: 'Payments DB', w: 140, h: 90 });
    b.node('catalogdb', 'db-nosql', 880, 440, { name: 'Catalog DB', w: 140, h: 90 });
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
    b.node('port', 'repository', 485, 225, { name: 'IOrderRepository (porta)' });
    b.node('agg', 'aggregate', 905, 70, { name: 'Order (Aggregate Root)' });
    b.node('evt', 'domain-event', 905, 225, { name: 'OrderCreated' });
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
    b.node('f1', 'boundary', 0, 0, { name: 'Feature: CreateOrder', w: 760, h: 200, z: BOUNDARY_Z });
    b.node('f2', 'boundary', 0, 240, { name: 'Feature: GetOrderById', w: 760, h: 200, z: BOUNDARY_Z });
    b.node('f3', 'boundary', 0, 480, { name: 'Feature: CancelOrder', w: 760, h: 200, z: BOUNDARY_Z });
    b.node('c1', 'command', 30, 70, { name: 'CreateOrderCommand', w: 150, h: 62 });
    b.node('v1', 'validator', 280, 70, { name: 'CreateOrderValidator', w: 150, h: 62 });
    b.node('h1', 'handler', 530, 70, { name: 'CreateOrderHandler', w: 160, h: 62 });
    b.node('q2', 'query', 30, 310, { name: 'GetOrderByIdQuery', w: 150, h: 62 });
    b.node('h2', 'handler', 530, 310, { name: 'GetOrderByIdHandler', w: 160, h: 62 });
    b.node('c3', 'command', 30, 550, { name: 'CancelOrderCommand', w: 150, h: 62 });
    b.node('v3', 'validator', 280, 550, { name: 'CancelOrderValidator', w: 150, h: 62 });
    b.node('h3', 'handler', 530, 550, { name: 'CancelOrderHandler', w: 160, h: 62 });
    b.node('shared', 'boundary', 860, 0, { name: 'Shared / Infrastructure', w: 320, h: 680, z: BOUNDARY_Z });
    b.node('db', 'db-relational', 940, 200, { name: 'Database', w: 160, h: 100 });
    b.node('mediator', 'application', 920, 70, { name: 'Mediator / Pipeline', w: 200, h: 70 });
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
    b.node('worker', 'worker', 560, 260, { name: 'Worker' });
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
    b.node('box', 'boundary', 0, 0, { name: 'Order Service', w: 880, h: 260, z: BOUNDARY_Z });
    b.node('ctrl', 'controller', 30, 90, { name: 'OrdersController' });
    b.node('svc', 'use-case', 330, 90, { name: 'OrderService' });
    b.node('repo', 'repository', 630, 90, { name: 'OrderRepository' });
    b.node('db', 'db-relational', 650, 340, { name: 'Orders DB', w: 150, h: 90 });
    b.edge('ctrl', 'svc', 'internal');
    b.edge('svc', 'repo', 'internal');
    b.edge('repo', 'db', 'db-access');
    return b.done(diagramReadme('Component Diagram', 'Componentes internos de um container.'));
  },
};

type Builder = ReturnType<typeof builder>;

function make(
  meta: Pick<DiagramTemplate, 'id' | 'name' | 'group' | 'icon' | 'description' | 'level'> & { styleIds?: string[]; patternIds?: string[] },
  readmeTitle: string,
  readmeDesc: string,
  draw: (b: Builder) => void,
): DiagramTemplate {
  return {
    ...meta,
    styleIds: meta.styleIds ?? [],
    patternIds: meta.patternIds ?? [],
    build() {
      const b = builder();
      draw(b);
      return b.done(diagramReadme(readmeTitle, readmeDesc));
    },
  };
}

const soa = make(
  {
    id: 'style-soa',
    name: 'SOA',
    group: 'style',
    icon: 'Share2',
    description: 'Serviços de negócio reutilizáveis integrados por um ESB.',
    level: 'container',
    styleIds: [STYLE_IDS.soa],
  },
  'Service-Oriented Architecture',
  'Serviços de granularidade grossa expostos por contratos e integrados por um barramento (ESB).',
  (b) => {
    b.node('portal', 'frontend-app', 0, 60, { name: 'Portal Web' });
    b.node('partner', 'external-service', 0, 260, { name: 'Parceiro B2B' });
    b.node('esb', 'event-bus', 300, 150, { name: 'ESB (Enterprise Service Bus)', w: 240, h: 90 });
    b.node('cust', 'application-service', 700, 0, { name: 'Serviço de Clientes', description: 'Contrato SOAP/WSDL' });
    b.node('bill', 'application-service', 700, 150, { name: 'Serviço de Faturamento' });
    b.node('inv', 'application-service', 700, 300, { name: 'Serviço de Estoque' });
    b.node('erp', 'external-service', 1000, 150, { name: 'ERP Legado' });
    b.edge('portal', 'esb', 'http');
    b.edge('partner', 'esb', 'http');
    b.edge('esb', 'cust', 'http', { protocol: 'SOAP' });
    b.edge('esb', 'bill', 'http', { protocol: 'SOAP' });
    b.edge('esb', 'inv', 'http', { protocol: 'SOAP' });
    b.edge('bill', 'erp', 'http');
  },
);

const serviceBased = make(
  {
    id: 'style-service-based',
    name: 'Service-Based',
    group: 'style',
    icon: 'Blocks',
    description: 'Poucos serviços de domínio grossos com banco compartilhado.',
    level: 'container',
    styleIds: [STYLE_IDS.serviceBased],
  },
  'Service-Based Architecture',
  'Poucos serviços de domínio de granularidade grossa, normalmente compartilhando um banco.',
  (b) => {
    b.node('ui', 'frontend-app', 0, 150, { name: 'Web App' });
    b.node('s1', 'application-service', 300, 20, { name: 'Serviço de Pedidos', w: 200, h: 80 });
    b.node('s2', 'application-service', 300, 150, { name: 'Serviço de Clientes', w: 200, h: 80 });
    b.node('s3', 'application-service', 300, 280, { name: 'Serviço de Catálogo', w: 200, h: 80 });
    b.node('db', 'db-relational', 640, 150, { name: 'Banco Compartilhado', w: 160, h: 100 });
    b.edge('ui', 's1', 'http');
    b.edge('ui', 's2', 'http');
    b.edge('ui', 's3', 'http');
    b.edge('s1', 'db', 'db-access');
    b.edge('s2', 'db', 'db-access');
    b.edge('s3', 'db', 'db-access');
  },
);

const serverless = make(
  {
    id: 'style-serverless',
    name: 'Serverless',
    group: 'style',
    icon: 'Zap',
    description: 'Funções sob demanda atrás de API, fila e storage gerenciados.',
    level: 'container',
    styleIds: [STYLE_IDS.serverless],
  },
  'Serverless Architecture',
  'Funções e serviços gerenciados executados sob demanda.',
  (b) => {
    b.node('web', 'frontend-app', 0, 220, { name: 'SPA' });
    b.node('cdn', 'cdn', 0, 0, { name: 'CDN' });
    b.node('gw', 'api-gateway', 260, 220, { name: 'API Gateway', w: 180, h: 80 });
    b.node('f1', 'serverless', 560, 40, { name: 'Função: CreateOrder' });
    b.node('f2', 'serverless', 560, 260, { name: 'Função: ProcessImage' });
    b.node('db', 'db-nosql', 860, 40, { name: 'DynamoDB' });
    b.node('s3', 'object-storage', 860, 260, { name: 'Bucket S3' });
    b.edge('web', 'cdn', 'http');
    b.edge('web', 'gw', 'http');
    b.edge('gw', 'f1', 'http');
    b.edge('f1', 'db', 'db-access');
    b.edge('s3', 'f2', 'event-publish', { label: 'ObjectCreated' });
    b.edge('f2', 's3', 'db-access');
  },
);

const microkernel = make(
  {
    id: 'style-microkernel',
    name: 'Microkernel',
    group: 'style',
    icon: 'Puzzle',
    description: 'Núcleo mínimo estendido por plug-ins independentes.',
    level: 'component',
    styleIds: [STYLE_IDS.microkernel],
  },
  'Microkernel (Plug-in) Architecture',
  'Um núcleo mínimo com pontos de extensão e plug-ins independentes.',
  (b) => {
    b.node('core', 'module', 300, 160, {
      name: 'Núcleo (Core System)',
      responsibility: 'Registro de plug-ins e fluxo básico.',
      w: 240,
      h: 110,
    });
    b.node('p1', 'module', 0, 0, { name: 'Plug-in: Pagamento PIX' });
    b.node('p2', 'module', 0, 160, { name: 'Plug-in: Cartão' });
    b.node('p3', 'module', 0, 320, { name: 'Plug-in: Boleto' });
    b.node('reg', 'repository', 680, 180, { name: 'Registro de Plug-ins' });
    b.edge('p1', 'core', 'dependency', { label: 'contrato' });
    b.edge('p2', 'core', 'dependency', { label: 'contrato' });
    b.edge('p3', 'core', 'dependency', { label: 'contrato' });
    b.edge('core', 'reg', 'internal');
  },
);

const spaceBased = make(
  {
    id: 'style-space-based',
    name: 'Space-Based',
    group: 'style',
    icon: 'Orbit',
    description: 'Grade de dados em memória replicada entre unidades de processamento.',
    level: 'container',
    styleIds: [STYLE_IDS.spaceBased],
  },
  'Space-Based Architecture',
  'Unidades de processamento com grade de dados em memória para escalar sem gargalo de banco.',
  (b) => {
    b.node('lb', 'load-balancer', 0, 170, { w: 160, h: 70 });
    b.node('pu1', 'boundary', 280, 0, { name: 'Processing Unit 1', w: 260, h: 180, z: BOUNDARY_Z });
    b.node('pu2', 'boundary', 280, 240, { name: 'Processing Unit 2', w: 260, h: 180, z: BOUNDARY_Z });
    b.node('a1', 'application-service', 310, 50, { name: 'App + Cache local', w: 200, h: 70 });
    b.node('a2', 'application-service', 310, 290, { name: 'App + Cache local', w: 200, h: 70 });
    b.node('grid', 'cache', 680, 170, { name: 'Data Grid (replicado)', w: 200, h: 90 });
    b.node('db', 'db-relational', 1000, 170, { name: 'Banco (write-behind)', w: 160, h: 100 });
    b.edge('lb', 'a1', 'http');
    b.edge('lb', 'a2', 'http');
    b.edge('a1', 'grid', 'db-access');
    b.edge('a2', 'grid', 'db-access');
    b.edge('grid', 'db', 'db-access', { label: 'assíncrono' });
  },
);

const pipeAndFilter = make(
  {
    id: 'style-pipe-and-filter',
    name: 'Pipe & Filter',
    group: 'style',
    icon: 'Filter',
    description: 'Dados fluem por filtros independentes conectados por pipes.',
    level: 'component',
    styleIds: [STYLE_IDS.pipeAndFilter],
  },
  'Pipe and Filter Architecture',
  'Cada filtro transforma os dados e os repassa por um pipe ao próximo.',
  (b) => {
    b.node('src', 'object-storage', 0, 80, { name: 'Fonte (arquivo CSV)', w: 150, h: 90 });
    b.node('f1', 'middleware', 280, 90, { name: 'Filtro: Parse' });
    b.node('f2', 'middleware', 560, 90, { name: 'Filtro: Validar' });
    b.node('f3', 'middleware', 840, 90, { name: 'Filtro: Enriquecer' });
    b.node('f4', 'middleware', 1120, 90, { name: 'Filtro: Agregar' });
    b.node('sink', 'data-warehouse', 1400, 80, { name: 'Destino (DW)' });
    b.edge('src', 'f1', 'internal', { label: 'pipe' });
    b.edge('f1', 'f2', 'internal', { label: 'pipe' });
    b.edge('f2', 'f3', 'internal', { label: 'pipe' });
    b.edge('f3', 'f4', 'internal', { label: 'pipe' });
    b.edge('f4', 'sink', 'internal', { label: 'pipe' });
  },
);

const clientServer = make(
  {
    id: 'style-client-server',
    name: 'Cliente-Servidor',
    group: 'style',
    icon: 'Monitor',
    description: 'Vários clientes consumindo um servidor centralizado.',
    level: 'container',
    styleIds: [STYLE_IDS.clientServer],
  },
  'Client-Server Architecture',
  'Clientes solicitam serviços a um servidor centralizado.',
  (b) => {
    b.node('c1', 'frontend-app', 0, 0, { name: 'Cliente Web' });
    b.node('c2', 'frontend-app', 0, 150, { name: 'App Mobile' });
    b.node('c3', 'frontend-app', 0, 300, { name: 'Cliente Desktop' });
    b.node('srv', 'api-rest', 360, 140, { name: 'Servidor de Aplicação', w: 220, h: 90 });
    b.node('db', 'db-relational', 720, 140, { name: 'Banco de Dados', w: 150, h: 100 });
    b.edge('c1', 'srv', 'http', { label: 'requisição' });
    b.edge('c2', 'srv', 'http', { label: 'requisição' });
    b.edge('c3', 'srv', 'http', { label: 'requisição' });
    b.edge('srv', 'db', 'db-access');
  },
);

const peerToPeer = make(
  {
    id: 'style-peer-to-peer',
    name: 'Peer-to-Peer',
    group: 'style',
    icon: 'Share2',
    description: 'Nós equivalentes compartilhando recursos sem servidor central.',
    level: 'container',
    styleIds: [STYLE_IDS.peerToPeer],
  },
  'Peer-to-Peer Architecture',
  'Nós equivalentes que atuam como cliente e servidor ao mesmo tempo.',
  (b) => {
    b.node('p1', 'software-system', 200, 0, { name: 'Peer A', w: 180, h: 90 });
    b.node('p2', 'software-system', 520, 0, { name: 'Peer B', w: 180, h: 90 });
    b.node('p3', 'software-system', 60, 220, { name: 'Peer C', w: 180, h: 90 });
    b.node('p4', 'software-system', 360, 300, { name: 'Peer D', w: 180, h: 90 });
    b.node('p5', 'software-system', 660, 220, { name: 'Peer E', w: 180, h: 90 });
    b.edge('p1', 'p2', 'internal', { direction: 'both' });
    b.edge('p1', 'p3', 'internal', { direction: 'both' });
    b.edge('p1', 'p4', 'internal', { direction: 'both' });
    b.edge('p2', 'p5', 'internal', { direction: 'both' });
    b.edge('p3', 'p4', 'internal', { direction: 'both' });
    b.edge('p4', 'p5', 'internal', { direction: 'both' });
  },
);

const hexagonal = make(
  {
    id: 'pattern-hexagonal',
    name: 'Hexagonal',
    group: 'pattern',
    icon: 'Plug',
    description: 'Núcleo isolado, portas e adaptadores de entrada e saída.',
    level: 'component',
    patternIds: [PATTERN_IDS.hexagonal],
  },
  'Hexagonal Architecture (Ports & Adapters)',
  'O núcleo da aplicação conversa com o exterior apenas por portas, implementadas por adaptadores.',
  (b) => {
    b.node('core', 'boundary', 300, 0, { name: 'Núcleo da Aplicação', w: 340, h: 340, z: BOUNDARY_Z });
    b.node('uc', 'use-case', 380, 80, { name: 'PlaceOrder' });
    b.node('dom', 'domain', 380, 230, { name: 'Modelo de Domínio' });
    b.node('inport', 'port', 300, 400, { name: 'Porta de entrada (IPlaceOrder)' });
    b.node('outport', 'port', 600, 400, { name: 'Porta de saída (IOrderRepository)' });
    b.node('rest', 'adapter', 0, 400, { name: 'Adapter REST (driving)' });
    b.node('repo', 'adapter', 900, 400, { name: 'Adapter JPA (driven)' });
    b.node('db', 'db-relational', 920, 570, { name: 'PostgreSQL', w: 140, h: 90 });
    b.edge('rest', 'inport', 'dependency');
    b.edge('inport', 'uc', 'dependency');
    b.edge('uc', 'dom', 'dependency');
    b.edge('uc', 'outport', 'dependency');
    b.edge('repo', 'outport', 'dependency', { label: 'implementa' });
    b.edge('repo', 'db', 'db-access');
  },
);

const onion = make(
  {
    id: 'pattern-onion',
    name: 'Onion',
    group: 'pattern',
    icon: 'Target',
    description: 'Camadas concêntricas com o domínio no centro.',
    level: 'component',
    patternIds: [PATTERN_IDS.onion],
  },
  'Onion Architecture',
  'Camadas concêntricas: as dependências sempre apontam para o centro.',
  (b) => {
    b.node('infra', 'boundary', 0, 0, { name: 'Infraestrutura / UI / Testes', w: 640, h: 560, z: BOUNDARY_Z });
    b.node('appsvc', 'boundary', 60, 60, { name: 'Serviços de Aplicação', w: 520, h: 420, z: BOUNDARY_Z });
    b.node('domsvc', 'boundary', 120, 120, { name: 'Serviços de Domínio', w: 400, h: 300, z: BOUNDARY_Z });
    b.node('model', 'entity', 235, 230, { name: 'Modelo de Domínio' });
    b.node('as', 'application-service', 90, 490, { name: 'OrderAppService', w: 170, h: 60 });
    b.node('ctrl', 'controller', 400, 490, { name: 'OrdersController', w: 170, h: 60 });
    b.edge('ctrl', 'as', 'dependency');
    b.edge('as', 'model', 'dependency');
  },
);

const ddd = make(
  {
    id: 'pattern-ddd',
    name: 'DDD',
    group: 'pattern',
    icon: 'BrickWall',
    description: 'Bounded contexts, agregados e context map.',
    level: 'component',
    patternIds: [PATTERN_IDS.ddd],
  },
  'Domain-Driven Design',
  'Bounded contexts com agregados, entidades e value objects, ligados por um context map.',
  (b) => {
    b.node('sales', 'boundary', 0, 0, { name: 'Bounded Context: Vendas', w: 420, h: 330, z: BOUNDARY_Z });
    b.node('ship', 'boundary', 560, 0, { name: 'Bounded Context: Entregas', w: 420, h: 330, z: BOUNDARY_Z });
    b.node('order', 'aggregate-root', 30, 70, { name: 'Order (Aggregate Root)' });
    b.node('item', 'entity', 30, 220, { name: 'OrderItem', w: 170, h: 60 });
    b.node('money', 'value-object', 230, 220, { name: 'Money', w: 150, h: 60 });
    b.node('dsvc', 'domain-service', 230, 70, { name: 'PricingService', w: 150, h: 60 });
    b.node('shipment', 'aggregate-root', 590, 70, { name: 'Shipment (Aggregate Root)' });
    b.node('addr', 'value-object', 590, 220, { name: 'Address', w: 150, h: 60 });
    b.edge('order', 'item', 'internal', { label: 'contém' });
    b.edge('order', 'shipment', 'event-publish', { label: 'OrderPlaced' });
  },
);

const cqrs = make(
  {
    id: 'pattern-cqrs',
    name: 'CQRS',
    group: 'pattern',
    icon: 'Split',
    description: 'Caminhos separados de escrita (commands) e leitura (queries).',
    level: 'component',
    patternIds: [PATTERN_IDS.cqrs],
  },
  'CQRS',
  'Modelos e caminhos distintos para escrita e leitura.',
  (b) => {
    b.node('api', 'api-rest', 0, 150, { name: 'API' });
    b.node('cmd', 'command', 300, 20, { name: 'PlaceOrderCommand' });
    b.node('ch', 'handler', 560, 20, { name: 'PlaceOrderHandler' });
    b.node('wdb', 'db-relational', 840, 10, { name: 'Banco de Escrita', w: 150, h: 90 });
    b.node('qry', 'query', 300, 300, { name: 'GetOrdersQuery' });
    b.node('qh', 'handler', 560, 300, { name: 'GetOrdersHandler' });
    b.node('rm', 'read-model', 840, 310, { name: 'Read Model (denormalizado)' });
    b.edge('api', 'cmd', 'internal');
    b.edge('cmd', 'ch', 'internal');
    b.edge('ch', 'wdb', 'db-access');
    b.edge('api', 'qry', 'internal');
    b.edge('qry', 'qh', 'internal');
    b.edge('qh', 'rm', 'db-access');
    b.edge('wdb', 'rm', 'event-publish', { label: 'projeção' });
  },
);

const eventSourcing = make(
  {
    id: 'pattern-event-sourcing',
    name: 'Event Sourcing',
    group: 'pattern',
    icon: 'ScrollText',
    description: 'Estado derivado de uma sequência imutável de eventos.',
    level: 'component',
    patternIds: [PATTERN_IDS.eventSourcing],
  },
  'Event Sourcing',
  'O estado atual é reconstruído a partir do log imutável de eventos.',
  (b) => {
    b.node('cmd', 'command', 0, 100, { name: 'DepositCommand' });
    b.node('agg', 'aggregate', 280, 100, { name: 'Account (Aggregate)' });
    b.node('evt', 'domain-event', 560, 100, { name: 'MoneyDeposited' });
    b.node('store', 'event-store', 840, 100, { name: 'Event Store (append-only)' });
    b.node('proj', 'event-handler', 840, 280, { name: 'Projeção' });
    b.node('rm', 'read-model', 560, 280, { name: 'Saldo atual (Read Model)' });
    b.edge('cmd', 'agg', 'internal');
    b.edge('agg', 'evt', 'dependency', { label: 'emite' });
    b.edge('evt', 'store', 'db-access', { label: 'append' });
    b.edge('store', 'proj', 'event-subscribe');
    b.edge('proj', 'rm', 'db-access');
  },
);

const saga = make(
  {
    id: 'pattern-saga',
    name: 'Saga',
    group: 'pattern',
    icon: 'GitBranch',
    description: 'Transação distribuída com passos locais e compensações.',
    level: 'container',
    patternIds: [PATTERN_IDS.saga],
  },
  'Saga (Orquestração)',
  'Um orquestrador coordena passos locais e dispara compensações em caso de falha.',
  (b) => {
    b.node('orch', 'saga', 300, 150, { name: 'Order Saga (Orquestrador)', w: 220, h: 80 });
    b.node('order', 'microservice', 0, 140, { name: 'Order Service' });
    b.node('pay', 'microservice', 640, 0, { name: 'Payment Service' });
    b.node('stock', 'microservice', 640, 150, { name: 'Inventory Service' });
    b.node('ship', 'microservice', 640, 300, { name: 'Shipping Service' });
    b.edge('order', 'orch', 'event-publish', { label: 'OrderCreated' });
    b.edge('orch', 'pay', 'queue-producer', { label: '1. cobrar' });
    b.edge('orch', 'stock', 'queue-producer', { label: '2. reservar' });
    b.edge('orch', 'ship', 'queue-producer', { label: '3. enviar' });
  },
);

const outbox = make(
  {
    id: 'pattern-outbox',
    name: 'Outbox',
    group: 'pattern',
    icon: 'Mailbox',
    description: 'Estado e evento gravados na mesma transação, publicados depois.',
    level: 'container',
    patternIds: [PATTERN_IDS.outbox],
  },
  'Transactional Outbox',
  'Eventos gravados na mesma transação do estado e publicados por um relay.',
  (b) => {
    b.node('svc', 'microservice', 0, 150, { name: 'Order Service' });
    b.node('db', 'boundary', 320, 40, { name: 'Banco de dados (1 transação)', w: 280, h: 300, z: BOUNDARY_Z });
    b.node('orders', 'db-relational', 380, 100, { name: 'Tabela Orders', w: 160, h: 80 });
    b.node('box', 'outbox', 380, 230, { name: 'Tabela Outbox', w: 160, h: 80 });
    b.node('relay', 'background-job', 720, 230, { name: 'Outbox Relay' });
    b.node('broker', 'message-broker', 1000, 230, { name: 'RabbitMQ', w: 170, h: 70 });
    b.edge('svc', 'orders', 'db-access');
    b.edge('svc', 'box', 'db-access');
    b.edge('relay', 'box', 'db-access', { label: 'lê pendentes' });
    b.edge('relay', 'broker', 'event-publish');
  },
);

const mvc = make(
  {
    id: 'pattern-mvc',
    name: 'MVC',
    group: 'pattern',
    icon: 'LayoutDashboard',
    description: 'Model, View e Controller.',
    level: 'component',
    patternIds: [PATTERN_IDS.mvc],
  },
  'Model-View-Controller',
  'O controller recebe a entrada, atualiza o model e escolhe a view.',
  (b) => {
    b.node('user', 'person', 0, 130, { name: 'Usuário' });
    b.node('ctrl', 'controller', 300, 130, { name: 'Controller' });
    b.node('model', 'entity', 600, 30, { name: 'Model' });
    b.node('view', 'frontend-app', 600, 230, { name: 'View' });
    b.edge('user', 'ctrl', 'http', { label: 'ação' });
    b.edge('ctrl', 'model', 'dependency', { label: 'atualiza' });
    b.edge('ctrl', 'view', 'dependency', { label: 'seleciona' });
    b.edge('view', 'model', 'dependency', { label: 'lê' });
  },
);

const mvvm = make(
  {
    id: 'pattern-mvvm',
    name: 'MVVM',
    group: 'pattern',
    icon: 'Monitor',
    description: 'Model, View e ViewModel com data binding.',
    level: 'component',
    patternIds: [PATTERN_IDS.mvvm],
  },
  'Model-View-ViewModel',
  'A View se liga ao ViewModel por data binding; o ViewModel expõe o Model.',
  (b) => {
    b.node('view', 'frontend-app', 0, 100, { name: 'View' });
    b.node('vm', 'application', 320, 100, { name: 'ViewModel' });
    b.node('model', 'entity', 640, 100, { name: 'Model' });
    b.node('svc', 'api-rest', 940, 100, { name: 'API / Serviço' });
    b.edge('view', 'vm', 'dependency', { label: 'data binding', direction: 'both' });
    b.edge('vm', 'model', 'dependency');
    b.edge('model', 'svc', 'http');
  },
);

const pubSub = make(
  {
    id: 'pattern-pub-sub',
    name: 'Pub/Sub',
    group: 'pattern',
    icon: 'Rss',
    description: 'Publicadores emitem mensagens a assinantes desacoplados.',
    level: 'container',
    patternIds: [PATTERN_IDS.pubSub],
  },
  'Publish/Subscribe',
  'Publicadores e assinantes se comunicam por tópicos, sem se conhecerem.',
  (b) => {
    b.node('pub1', 'producer', 0, 40, { name: 'Publisher A' });
    b.node('pub2', 'producer', 0, 220, { name: 'Publisher B' });
    b.node('topic', 'topic', 340, 130, { name: 'Tópico: eventos.pedido', w: 220, h: 70 });
    b.node('sub1', 'consumer', 720, 0, { name: 'Subscriber 1' });
    b.node('sub2', 'consumer', 720, 140, { name: 'Subscriber 2' });
    b.node('sub3', 'consumer', 720, 280, { name: 'Subscriber 3' });
    b.edge('pub1', 'topic', 'event-publish');
    b.edge('pub2', 'topic', 'event-publish');
    b.edge('topic', 'sub1', 'event-subscribe');
    b.edge('topic', 'sub2', 'event-subscribe');
    b.edge('topic', 'sub3', 'event-subscribe');
  },
);

const strangler = make(
  {
    id: 'pattern-strangler',
    name: 'Strangler Fig',
    group: 'pattern',
    icon: 'Route',
    description: 'Migração gradual de um legado, rota por rota.',
    level: 'container',
    patternIds: [PATTERN_IDS.strangler],
  },
  'Strangler Fig',
  'Um proxy desvia rotas migradas para o novo sistema, mantendo o resto no legado.',
  (b) => {
    b.node('client', 'frontend-app', 0, 150, { name: 'Clientes' });
    b.node('facade', 'reverse-proxy', 280, 150, { name: 'Fachada / Proxy', w: 180, h: 80 });
    b.node('legacy', 'monolith', 640, 20, { name: 'Sistema Legado', w: 220, h: 100 });
    b.node('new1', 'microservice', 640, 200, { name: 'Novo: Pedidos' });
    b.node('new2', 'microservice', 640, 340, { name: 'Novo: Catálogo' });
    b.node('ldb', 'db-relational', 960, 20, { name: 'Banco Legado', w: 140, h: 90 });
    b.edge('client', 'facade', 'http');
    b.edge('facade', 'legacy', 'http', { label: 'rotas pendentes' });
    b.edge('facade', 'new1', 'http', { label: '/pedidos (migrado)' });
    b.edge('facade', 'new2', 'http', { label: '/catalogo (migrado)' });
    b.edge('legacy', 'ldb', 'db-access');
  },
);

const acl = make(
  {
    id: 'pattern-acl',
    name: 'Anti-Corruption Layer',
    group: 'pattern',
    icon: 'Fence',
    description: 'Tradução entre o domínio e um modelo legado/externo.',
    level: 'component',
    patternIds: [PATTERN_IDS.acl],
  },
  'Anti-Corruption Layer',
  'Uma camada de tradução impede que o modelo legado contamine o domínio.',
  (b) => {
    b.node('dom', 'bounded-context', 0, 120, { name: 'Novo Domínio', w: 240, h: 100 });
    b.node('acl', 'anti-corruption-layer', 340, 120, { name: 'Anti-Corruption Layer', w: 200, h: 100 });
    b.node('map', 'mapper', 340, 330, { name: 'Tradutor de modelos' });
    b.node('legacy', 'external-service', 660, 120, { name: 'Sistema Legado', w: 200, h: 100 });
    b.edge('dom', 'acl', 'dependency');
    b.edge('acl', 'legacy', 'http');
    b.edge('acl', 'map', 'internal');
  },
);

const dbPerService = make(
  {
    id: 'pattern-db-per-service',
    name: 'DB por Serviço',
    group: 'pattern',
    icon: 'Database',
    description: 'Cada serviço é dono exclusivo dos seus dados.',
    level: 'container',
    patternIds: [PATTERN_IDS.dbPerService],
  },
  'Database per Service',
  'Cada serviço possui seu banco; outros acessam apenas pela API.',
  (b) => {
    b.node('s1', 'microservice', 0, 0, { name: 'Order Service' });
    b.node('s2', 'microservice', 0, 200, { name: 'Customer Service' });
    b.node('s3', 'microservice', 0, 400, { name: 'Catalog Service' });
    b.node('d1', 'db-relational', 360, 0, { name: 'Orders DB', w: 140, h: 90 });
    b.node('d2', 'db-relational', 360, 200, { name: 'Customers DB', w: 140, h: 90 });
    b.node('d3', 'db-nosql', 360, 400, { name: 'Catalog DB', w: 140, h: 90 });
    b.edge('s1', 'd1', 'db-access');
    b.edge('s2', 'd2', 'db-access');
    b.edge('s3', 'd3', 'db-access');
    b.edge('s1', 's2', 'http', { label: 'via API' });
  },
);

const apiComposition = make(
  {
    id: 'pattern-api-composition',
    name: 'API Composition',
    group: 'pattern',
    icon: 'Merge',
    description: 'Um compositor agrega respostas de vários serviços.',
    level: 'container',
    patternIds: [PATTERN_IDS.apiComposition],
  },
  'API Composition',
  'Um compositor consulta vários serviços e junta as respostas.',
  (b) => {
    b.node('client', 'frontend-app', 0, 150, { name: 'Cliente' });
    b.node('comp', 'bff', 280, 150, { name: 'API Composer' });
    b.node('s1', 'microservice', 600, 0, { name: 'Order Service' });
    b.node('s2', 'microservice', 600, 150, { name: 'Customer Service' });
    b.node('s3', 'microservice', 600, 300, { name: 'Shipping Service' });
    b.edge('client', 'comp', 'http');
    b.edge('comp', 's1', 'http', { label: 'GET pedido' });
    b.edge('comp', 's2', 'http', { label: 'GET cliente' });
    b.edge('comp', 's3', 'http', { label: 'GET entrega' });
  },
);

const circuitBreaker = make(
  {
    id: 'pattern-circuit-breaker',
    name: 'Circuit Breaker',
    group: 'pattern',
    icon: 'ToggleLeft',
    description: 'Interrompe chamadas a dependências em falha.',
    level: 'component',
    patternIds: [PATTERN_IDS.circuitBreaker],
  },
  'Circuit Breaker',
  'O disjuntor abre após falhas sucessivas, evitando falhas em cascata.',
  (b) => {
    b.node('caller', 'microservice', 0, 120, { name: 'Order Service' });
    b.node('cb', 'middleware', 320, 120, { name: 'Circuit Breaker', description: 'Closed → Open → Half-Open', w: 200, h: 90 });
    b.node('dep', 'external-service', 680, 120, { name: 'Payment Gateway (instável)' });
    b.node('fb', 'handler', 320, 300, { name: 'Fallback' });
    b.edge('caller', 'cb', 'http');
    b.edge('cb', 'dep', 'http', { label: 'closed' });
    b.edge('cb', 'fb', 'internal', { label: 'open' });
  },
);

const bulkhead = make(
  {
    id: 'pattern-bulkhead',
    name: 'Bulkhead',
    group: 'pattern',
    icon: 'Shield',
    description: 'Pools de recursos isolados por dependência.',
    level: 'component',
    patternIds: [PATTERN_IDS.bulkhead],
  },
  'Bulkhead',
  'Recursos isolados por dependência contêm a falha em um compartimento.',
  (b) => {
    b.node('svc', 'api-rest', 0, 160, { name: 'API' });
    b.node('p1', 'boundary', 300, 0, { name: 'Pool A (20 threads)', w: 280, h: 140, z: BOUNDARY_Z });
    b.node('p2', 'boundary', 300, 200, { name: 'Pool B (10 threads)', w: 280, h: 140, z: BOUNDARY_Z });
    b.node('h1', 'handler', 340, 50, { name: 'Cliente Pagamentos', w: 200, h: 60 });
    b.node('h2', 'handler', 340, 250, { name: 'Cliente Relatórios', w: 200, h: 60 });
    b.node('d1', 'external-service', 720, 50, { name: 'Pagamentos' });
    b.node('d2', 'external-service', 720, 250, { name: 'Relatórios (lento)' });
    b.edge('svc', 'h1', 'internal');
    b.edge('svc', 'h2', 'internal');
    b.edge('h1', 'd1', 'http');
    b.edge('h2', 'd2', 'http');
  },
);

const sidecar = make(
  {
    id: 'pattern-sidecar',
    name: 'Sidecar',
    group: 'pattern',
    icon: 'Cable',
    description: 'Processo auxiliar implantado junto ao serviço.',
    level: 'container',
    patternIds: [PATTERN_IDS.sidecar],
  },
  'Sidecar',
  'Um contêiner auxiliar (proxy, logs, segurança) roda no mesmo pod do serviço.',
  (b) => {
    b.node('pod', 'boundary', 200, 0, { name: 'Pod', w: 560, h: 220, z: BOUNDARY_Z });
    b.node('app', 'container', 240, 80, { name: 'Aplicação', w: 160, h: 90 });
    b.node('side', 'container', 520, 80, { name: 'Sidecar (proxy / logs)', w: 160, h: 90 });
    b.node('other', 'microservice', 960, 80, { name: 'Outro serviço' });
    b.node('obs', 'external-service', 520, 330, { name: 'Observabilidade' });
    b.edge('app', 'side', 'internal', { label: 'localhost' });
    b.edge('side', 'other', 'http', { label: 'mTLS' });
    b.edge('side', 'obs', 'http', { label: 'métricas / logs' });
  },
);

const cacheAside = make(
  {
    id: 'pattern-cache-aside',
    name: 'Cache-Aside',
    group: 'pattern',
    icon: 'DatabaseZap',
    description: 'Consulta o cache e, em miss, carrega da origem.',
    level: 'component',
    patternIds: [PATTERN_IDS.cacheAside],
  },
  'Cache-Aside',
  'A aplicação consulta o cache; em miss, lê do banco e preenche o cache.',
  (b) => {
    b.node('app', 'application-service', 0, 130, { name: 'Aplicação' });
    b.node('cache', 'cache', 340, 20, { name: 'Redis' });
    b.node('db', 'db-relational', 340, 260, { name: 'PostgreSQL', w: 150, h: 100 });
    b.edge('app', 'cache', 'db-access', { label: '1. get / 3. set' });
    b.edge('app', 'db', 'db-access', { label: '2. em miss, lê' });
  },
);

export const TEMPLATES: DiagramTemplate[] = [
  blank,
  monolith,
  modularMonolith,
  microservices,
  eventDriven,
  soa,
  serviceBased,
  serverless,
  microkernel,
  spaceBased,
  pipeAndFilter,
  clientServer,
  peerToPeer,
  clean,
  verticalSlice,
  layered,
  hexagonal,
  onion,
  ddd,
  cqrs,
  eventSourcing,
  saga,
  outbox,
  mvc,
  mvvm,
  pubSub,
  strangler,
  acl,
  dbPerService,
  apiComposition,
  circuitBreaker,
  bulkhead,
  sidecar,
  cacheAside,
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
