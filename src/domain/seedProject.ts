import { PATTERN_IDS, STYLE_IDS } from '@/data/architecture';
import type { BundleDiagram, BundleDocument, ProjectBundle } from '@/types';
import { newId, nowIso } from '@/utils/id';
import { diagramReadme } from './docTemplates';
import { createDiagram } from './factories';
import { getTemplate } from './templates';

const PROJECT_README = `# Plataforma de E-commerce

Loja online composta por serviços independentes que se comunicam por HTTP/gRPC e por eventos.

## Estilo arquitetural
**Microservices** como estilo principal, com **Event-Driven** para propagar fatos de negócio.

## Padrões internos
| Serviço | Padrão |
| --- | --- |
| Order Service | Clean Architecture |
| Payment Service | Vertical Slice |
| Catalog Service | Layered |

## Mapa de diagramas
1. Contexto do sistema
2. Microsserviços (clique em *Order Service* ou *Payment Service* para detalhar)
3. Fluxo de eventos
`;

export function buildExampleBundle(): ProjectBundle {
  const projectId = newId();
  const now = nowIso();
  const docs: BundleDocument[] = [
    { id: `project:${projectId}`, scope: 'project', ownerId: projectId, projectId, content: PROJECT_README, updatedAt: now },
  ];

  const make = (name: string, templateId: string, extra: Partial<BundleDiagram> = {}): BundleDiagram => {
    const tpl = getTemplate(templateId);
    const built = tpl.build();
    const d = createDiagram({
      projectId,
      name,
      level: tpl.level,
      styleIds: extra.styleIds ?? tpl.styleIds,
      patternIds: extra.patternIds ?? tpl.patternIds,
      nodes: built.nodes,
      edges: built.edges,
    });
    docs.push({
      id: `diagram:${d.id}`,
      scope: 'diagram',
      ownerId: d.id,
      projectId,
      content: built.readme || diagramReadme(name),
      updatedAt: now,
    });
    return { ...d, description: extra.description ?? '' };
  };

  const context = make('Contexto do sistema', 'c4-context', { description: 'Visão macro do sistema e seus atores.' });
  const orderInternal = make('Order Service · Arquitetura interna', 'pattern-clean', { patternIds: [PATTERN_IDS.clean] });
  const paymentInternal = make('Payment Service · Arquitetura interna', 'pattern-vertical-slice');
  const micro = make('Microsserviços', 'style-microservices', {
    styleIds: [STYLE_IDS.microservices],
    patternIds: [PATTERN_IDS.clean, PATTERN_IDS.verticalSlice, PATTERN_IDS.layered],
  });
  const events = make('Fluxo de eventos', 'style-event-driven', { styleIds: [STYLE_IDS.eventDriven] });

  micro.nodes = micro.nodes.map((n) => {
    const p = n.properties;
    if (p.name === 'Order Service')
      return {
        ...n,
        properties: { ...p, linkedDiagramId: orderInternal.id, patternId: PATTERN_IDS.clean, responsibility: 'Ciclo de vida do pedido.' },
      };
    if (p.name === 'Payment Service')
      return {
        ...n,
        properties: {
          ...p,
          linkedDiagramId: paymentInternal.id,
          patternId: PATTERN_IDS.verticalSlice,
          responsibility: 'Cobrança e conciliação.',
        },
      };
    if (p.name === 'Catalog Service') return { ...n, properties: { ...p, patternId: PATTERN_IDS.layered } };
    return n;
  });

  return {
    format: 'archdraw.project',
    version: 1,
    exportedAt: now,
    project: {
      id: projectId,
      name: 'Plataforma de E-commerce',
      description: 'Exemplo: microsserviços com comunicação por eventos; serviços internos com padrões distintos.',
      primaryStyleId: STYLE_IDS.microservices,
      secondaryStyleIds: [STYLE_IDS.eventDriven],
      reusableComponents: [],
      createdAt: now,
      updatedAt: now,
    },
    diagrams: [context, micro, orderInternal, paymentInternal, events],
    documents: docs,
  };
}
