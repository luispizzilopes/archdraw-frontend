export function diagramReadme(name: string, intro = ''): string {
  return `# ${name}

${intro ? `${intro}\n\n` : ''}## Objetivo da arquitetura
_Qual problema esta arquitetura resolve e para quem?_

## Contexto do sistema
_Quem usa, quais sistemas se integram, quais limites do escopo._

## Componentes e responsabilidades
| Componente | Responsabilidade | Tecnologia |
| --- | --- | --- |
|  |  |  |

## Fluxos de comunicação
_Descreva os principais fluxos (síncronos e assíncronos)._

## Decisões arquiteturais
- **Decisão:** 
  - **Motivo:** 
  - **Alternativas consideradas:** 

## Restrições
- 

## Trade-offs
| Ganho | Custo |
| --- | --- |
|  |  |

## Escalabilidade
_Gargalos esperados, estratégia de escala._

## Observabilidade
_Logs, métricas, traces, alertas._

## Segurança
_Autenticação, autorização, proteção de dados._
`;
}

export function projectDoc(name: string, description: string): string {
  return `# ${name}

${description || '_Resumo do projeto._'}

## Visão geral
_Propósito do sistema e principais capacidades de negócio._

## Estilo arquitetural
_Estilo(s) principal(is) adotado(s) e por quê._

## Mapa de diagramas
- 

## Glossário
| Termo | Definição |
| --- | --- |
|  |  |

## Princípios e diretrizes
- 

## Decisões gerais (ADRs)
- 
`;
}

export interface DocSnippet {
  label: string;
  body: string;
}

export const DOC_SNIPPETS: DocSnippet[] = [
  {
    label: 'Decisão arquitetural (ADR)',
    body: `\n### ADR-000: Título da decisão\n- **Status:** proposta | aceita | substituída\n- **Contexto:** \n- **Decisão:** \n- **Consequências:** \n`,
  },
  { label: 'Tabela de trade-offs', body: `\n| Opção | Prós | Contras |\n| --- | --- | --- |\n|  |  |  |\n` },
  {
    label: 'Fluxo de comunicação',
    body: `\n### Fluxo: nome\n1. Cliente → **API Gateway** (HTTPS)\n2. Gateway → **Serviço** (REST)\n3. Serviço publica \`EventoOcorrido\`\n`,
  },
  { label: 'Bloco de código', body: '\n```ts\n// exemplo\n```\n' },
  {
    label: 'Checklist de segurança',
    body: `\n- [ ] Autenticação\n- [ ] Autorização por recurso\n- [ ] Dados sensíveis criptografados\n- [ ] Segredos fora do código\n`,
  },
  { label: 'Observabilidade', body: `\n- **Logs:** \n- **Métricas:** \n- **Traces:** \n- **Alertas:** \n` },
];
