export interface TechGroup {
  title: string;
  items: string[];
  kind?: 'pattern';
}

export interface RepoInfo {
  name: string;
  summary: string;
  groups: TechGroup[];
}

// Conteúdo extraído de package.json, dos .csproj e dos READMEs de cada repositório.
export const FRONTEND_INFO: RepoInfo = {
  name: 'archdraw-frontend',
  summary: 'SPA em React 19 e TypeScript: editor de diagramas com React Flow, documentação em Markdown e navegação do nível macro ao detalhe.',
  groups: [
    { title: 'Tecnologias', items: ['React 19', 'TypeScript', 'Vite', 'React Router 7', 'Axios'] },
    { title: 'Bibliotecas', items: ['@xyflow/react (React Flow)', 'styled-components 6', 'Zustand', 'react-markdown + remark-gfm', 'html-to-image', 'lucide-react', 'idb'] },
    { title: 'Qualidade', items: ['Vitest', 'Testing Library', 'oxlint', 'Prettier'] },
    { title: 'Arquitetura e padrões', kind: 'pattern', items: ['Page → Hook → Service → Axios', 'Custom hooks por operação', 'Service objects', 'Regras em domain/ (funções puras)', 'Store Zustand só no editor', 'Design tokens CSS (tema claro/escuro)'] },
  ],
};

export const BACKEND_INFO: RepoInfo = {
  name: 'archdraw-backend',
  summary: 'API REST em .NET 8 para projetos, diagramas, componentes reutilizáveis e documentos, com autenticação JWT e PostgreSQL.',
  groups: [
    { title: 'Tecnologias', items: ['.NET 8 / ASP.NET Core', 'C#', 'PostgreSQL 16', 'Docker'] },
    { title: 'Bibliotecas', items: ['EF Core + Npgsql', 'MediatR', 'FluentValidation', 'ErrorOr', 'ASP.NET Core Identity + JwtBearer', 'Asp.Versioning', 'Swashbuckle', 'Serilog', 'AWSSDK.S3', 'Redis (opcional)'] },
    { title: 'Qualidade', items: ['xUnit', 'Testcontainers (PostgreSQL real)'] },
    { title: 'Arquitetura e padrões', kind: 'pattern', items: ['Clean Architecture', 'DDD', 'CQRS', 'Repository + Unit of Work', 'ErrorOr (Result pattern)', 'Pipeline Behaviors', 'Domain Events', 'Concorrência otimista (Revision / 409)', 'API versionada (V1)'] },
  ],
};
