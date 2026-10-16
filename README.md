# Archdraw — Frontend

SPA em React 19 / TypeScript para modelar **arquitetura de software**: estilos e padrões arquiteturais como conceitos distintos, diagramas semânticos (React Flow), README por diagrama e navegação do nível macro ao detalhe. Consome a API `archdraw-backend` (autenticação JWT, PostgreSQL).

O padrão de camadas segue o frontend Kerdos (Page → Hook → Service → Axios); a identidade visual e o editor são os do MVP.

## Sumário

- [Stack](#stack) · [Arquitetura](#arquitetura) · [Estrutura de pastas](#estrutura-de-pastas)
- [Design patterns](#design-patterns) · [Rotas](#rotas) · [Contextos](#contextos)
- [Integração HTTP](#integração-http) · [Editor de diagramas](#editor-de-diagramas)
- [Migração dos dados locais](#migração-dos-dados-locais) · [Variáveis de ambiente](#variáveis-de-ambiente)
- [Execução](#execução) · [Build](#build) · [Testes](#testes) · [Convenções](#convenções) · [Boas práticas](#boas-práticas)

## Stack

| Categoria | Biblioteca |
|---|---|
| UI / linguagem / build | React 19, TypeScript, Vite |
| Estilização | styled-components 6 (+ tokens CSS do MVP em `globalStyle.ts`) |
| Roteamento | react-router-dom 7 |
| HTTP | axios |
| Canvas | @xyflow/react (React Flow) |
| Estado do canvas | zustand (somente o editor) |
| Markdown | react-markdown + remark-gfm (sem HTML bruto) |
| Export de imagem | html-to-image |
| Ícones | lucide-react |
| Qualidade | oxlint, prettier, vitest + Testing Library (jsdom), fake-indexeddb |

## Arquitetura

```
Page / Component      renderiza e orquestra layout        (não chama service)
      ↓
Custom Hook           loading, error, mutações, cache      (useProjects, useSaveDiagram, ...)
      ↓
Service               HTTP puro, sem estado, sem regra     (projectService, diagramService, ...)
      ↓
api.ts (axios)        base URL, token, 401 → refresh
      ↓
REST API
```

| Camada | Pode chamar | Não pode chamar |
|---|---|---|
| Page / Component | Hooks, outros components | Services, `api.ts` |
| Hook | Services, `domain/` | `api.ts` direto |
| Service | `api.ts` | Hooks, components |
| `domain/` | — (funções puras) | React, HTTP, storage |

Regras de negócio e adaptação de formato **não** ficam nos services: ficam em `domain/` (templates, factories, mapeadores API↔editor, bundle de export/import, projeto de exemplo).

## Estrutura de pastas

```
src/
├── components/
│   ├── ui/            componentes comuns (Modal, Menu, Toast, Field, AuthLayout/, FormError/ ...)
│   ├── layout/        AppShell, UserMenu
│   ├── editor/        Canvas, ArchNode, SemanticEdge, Library, PropertiesPanel, Toolbar,
│   │                  SaveIndicator, ConflictDialog, DraftRecoveryDialog
│   ├── markdown/      MarkdownEditor, MarkdownPreview, DocPanel
│   └── project/       modais de projeto/diagrama/templates, MigrationBanner
├── contexts/          AuthContext
├── data/              catálogos (estilos, padrões, componentes, conexões), domains.ts (URL da API)
├── domain/            lógica pura: apiMappers, projectBundle, seedProject, newDiagram, templates, flowMapper...
├── hooks/             um hook por operação (useProjects, useCreateProject, useSaveDiagram, ...)
├── pages/             Dashboard, Projects, Project, Editor, Settings + auth/{Login,Register,ForgotPassword}, profile/
├── routes/            router.tsx, PrivateRoutes.tsx, PublicRoutes.tsx
├── services/          api/api.ts + auth/ project/ diagram/ architecturalComponent/ documentation/ legacy/
├── store/             editorStore (zustand) — estado interativo do canvas
├── types/             contratos (index.ts), wire format da API (api.ts), auth.ts
├── utils/             apiError (extractApiError), dataEvents, draftStorage, validation, download, ...
├── globalStyle.ts     GlobalStyle (tokens + estilos do MVP)
├── App.tsx · main.tsx
```

Desvios em relação à referência: mantive `components/ui` e `components/editor` (nomes do MVP) em vez de `common`/`diagram`, e as páginas antigas continuam planas (`pages/DashboardPage.tsx`); componentes e páginas **novos** seguem `Nome/Nome.tsx + Nome.styles.ts`.

## Design patterns

- **Hooks por operação.** Leitura: `{ data|nome, loading, error, reload }` (base `useRequest`, descarta respostas obsoletas e recarrega quando uma mutação emite `dataEvents`). Mutação: `{ execute, loading, error }` (base `useMutation`; `execute` rejeita com mensagem já amigável).
- **Service objects:** objetos literais com métodos `async`, tipados.
- **`extractApiError`:** normaliza erros da API (`errors[]`, `description`, status, rede). Mensagens de validação do cliente usam `UserFacingError`.
- **Estilos:** o visual do MVP foi migrado **sem alteração** para `GlobalStyle` (tokens, tema escuro/claro). Componentes novos usam styled-components sobre esses tokens; os componentes antigos continuam com as classes globais e migram aos poucos.

## Rotas

| Rota | Acesso | Página |
|---|---|---|
| `/login` · `/register` · `/forgot-password` | Pública (autenticado → `/`) | auth |
| `/` | Privada | Dashboard (resumo, recentes, migração) |
| `/projects` · `/projects/:projectId` | Privada | Lista / projeto (diagramas, README, componentes) |
| `/projects/:projectId/diagrams/:diagramId` | Privada | Editor |
| `/profile` · `/settings` | Privada | Perfil (foto, nome, senha) / preferências |

`PrivateRoutes` redireciona ao login lembrando o destino; `PublicRoutes` redireciona quem já está autenticado.

## Contextos

Apenas `AuthContext`: usuário, `restoring` (restauração da sessão no boot), `logout`. O tema continua em `useTheme`/`settingsService` (preferência de interface em `localStorage`, que não é dado de negócio).

## Integração HTTP

`services/api/api.ts` centraliza tudo:

- `baseURL` de `VITE_API_URL`, `withCredentials` (cookie de refresh), timeout de 30 s.
- **Access token só em memória** (nunca em storage); o refresh token é cookie `HttpOnly` gerenciado pelo servidor. No boot, `restoreSession()` tenta o refresh.
- Interceptor de 401: renova a sessão **uma única vez** (compartilhada entre requisições simultâneas, com `navigator.locks` entre abas) e repete a requisição; se falhar, limpa a sessão e o `AuthProvider` leva ao login.
- Rotas de autenticação não disparam renovação.

## Editor de diagramas

O editor do MVP foi preservado (React Flow, nós semânticos, conexões, waypoints, undo/redo, grid/snap, alinhamento, atalhos). O que mudou foi a persistência:

```
abrir:   useDiagram → diagramService.getFull (metadados + snapshot) → apiMappers → editorStore.load
editar:  editorStore (zustand) → revision++ → debounce 500 ms → useSaveDiagram → PUT /snapshot (baseRevision)
```

**`useSaveDiagram`**

- Salva só quando o **conteúdo** muda, com debounce; envios são **serializados** (um por vez) e cada um usa a revisão devolvida pelo anterior — respostas antigas não sobrescrevem estado novo.
- Metadados (nome, descrição, nível, estilos) vão por `PUT /diagrams/{id}`; pan/zoom não geram salvamento (seguem no próximo).
- **Estados:** `saving`, `saved`, `error` (nova tentativa manual + automática 3×), `conflict`.
- **Conflito (409):** os envios são bloqueados, o trabalho local é preservado e o `ConflictDialog` oferece: salvar minha versão como cópia (recomendado), manter a minha (sobrescreve conscientemente) ou usar a do servidor (a local fica no rascunho).
- **Rascunho local** (`localStorage`, por diagrama, com `baseRevision`): protege contra aba fechada/queda antes da sincronização. Ao abrir, se a revisão do servidor é a mesma, oferece recuperar; se avançou, oferece salvar como cópia. É apagado após cada salvamento confirmado. Não é fonte de dados.
- `beforeunload` avisa enquanto houver alterações não sincronizadas; salva ao ocultar a aba e ao sair do editor.

**Componentes compartilhados:** "Salvar na biblioteca do projeto" cria um *componente arquitetural* e vincula o nó a ele (`componentId`). Nós vinculados mostram as propriedades do componente; editar atualiza o componente (debounce) e todos os diagramas. "Desvincular" mantém uma cópia independente. Copiar/colar/duplicar gera nós independentes; só a biblioteca cria novas representações do mesmo componente.

**Documentação:** `useDocument` (README do projeto/diagrama) tem o mesmo tratamento de revisão/conflito/erro. O Markdown é renderizado sem HTML bruto.

## Migração dos dados locais

O MVP guardava tudo no IndexedDB (`archdraw`, versão 1). `legacyStorageService` lê esse banco **somente leitura**; o `MigrationBanner` (Dashboard e Configurações) lista os projetos e envia cada um a `POST /projects/import` (idempotente: reimportar não duplica). Mostra o resultado por projeto (e avisos) e **nunca apaga** o banco local sozinho: o botão "Apagar dados locais" só aparece depois que todos os projetos foram confirmados e pede confirmação.

Importar um arquivo JSON exportado cria sempre um projeto novo (cópia).

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL da API (padrão `http://localhost:5080`). Veja `.env.example`. Nunca coloque segredos aqui. |

## Execução

```bash
cd archdraw-frontend
cp .env.example .env.local
npm install
npm run dev          # http://localhost:5173   (a API deve estar em VITE_API_URL)
```

A origem `http://localhost:5173` já está liberada no CORS do ambiente `Localhost` do backend.

## Build

```bash
npm run build        # tsc -b + vite build → dist/
npm run preview
```

## Testes

```bash
npm test             # vitest run (jsdom)
npm run lint         # oxlint
npm run format       # prettier
```

Cobrem os fluxos críticos: salvamento do editor (debounce, serialização, revisão base, 409 com resolução, erro/retry, rascunho, `beforeunload`), documento (revisão/conflito), interceptors de sessão (refresh único, repetição, falha → logout), guardas de rota, Login, migração do IndexedDB (leitura, idempotência, limpeza explícita), mapeamentos API↔editor e bundle de export/import.

## Convenções

| Item | Padrão |
|---|---|
| Componente | `Nome/Nome.tsx` + `Nome.styles.ts` |
| Hook | `use<Operação>.ts` (um por operação) |
| Service | `services/<domínio>/<domínio>Service.ts` |
| Tipos | sem `any`; wire format em `types/api.ts` |
| Erros | `extractApiError`; `UserFacingError` para validações do cliente |

## Boas práticas

- Nunca chamar service em page/component; nunca guardar token em storage; nunca confiar em ids do cliente para autorização (o servidor decide).
- Ids de nós/conexões são Guids gerados no cliente e permanecem estáveis; cópias de diagrama regeneram ids.
- Ao criar hooks de leitura que não podem recarregar sozinhos (estado vivo do editor), use `refreshOnChange: false`.
