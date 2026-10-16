import type { ArchitecturalPattern, ArchitecturalStyle } from '@/types';

export const STYLE_IDS = {
  monolith: 'monolith',
  modularMonolith: 'modular-monolith',
  microservices: 'microservices',
  eventDriven: 'event-driven',
} as const;

export const PATTERN_IDS = {
  clean: 'clean-architecture',
  verticalSlice: 'vertical-slice',
  layered: 'layered',
} as const;

export const ARCHITECTURAL_STYLES: ArchitecturalStyle[] = [
  {
    id: STYLE_IDS.monolith,
    name: 'Monolithic Architecture',
    short: 'Monolito',
    summary: 'Uma única unidade de implantação.',
    conflictsWith: [STYLE_IDS.microservices, STYLE_IDS.modularMonolith],
  },
  {
    id: STYLE_IDS.modularMonolith,
    name: 'Modular Monolith',
    short: 'Monolito Modular',
    summary: 'Uma unidade de implantação com módulos de fronteiras bem definidas.',
    conflictsWith: [STYLE_IDS.monolith],
  },
  {
    id: STYLE_IDS.microservices,
    name: 'Microservices Architecture',
    short: 'Microsserviços',
    summary: 'Serviços independentes, cada um com responsabilidade específica.',
    conflictsWith: [STYLE_IDS.monolith],
  },
  {
    id: STYLE_IDS.eventDriven,
    name: 'Event-Driven Architecture',
    short: 'Orientada a Eventos',
    summary: 'Comunicação e processamento baseados em eventos.',
    conflictsWith: [],
  },
];

export const ARCHITECTURAL_PATTERNS: ArchitecturalPattern[] = [
  {
    id: PATTERN_IDS.clean,
    name: 'Clean Architecture',
    short: 'Clean',
    summary: 'Separação de responsabilidades com dependências apontando para o domínio.',
  },
  {
    id: PATTERN_IDS.verticalSlice,
    name: 'Vertical Slice Architecture',
    short: 'Vertical Slice',
    summary: 'Código organizado por funcionalidade ou caso de uso.',
  },
  {
    id: PATTERN_IDS.layered,
    name: 'Layered Architecture',
    short: 'Layered',
    summary: 'Camadas de apresentação, aplicação, dados e infraestrutura.',
  },
];

export const getStyle = (id: string) => ARCHITECTURAL_STYLES.find((s) => s.id === id);
export const getPattern = (id: string) => ARCHITECTURAL_PATTERNS.find((p) => p.id === id);
