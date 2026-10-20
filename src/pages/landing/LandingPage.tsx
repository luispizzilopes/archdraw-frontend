import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Cable,
  FileText,
  GitFork,
  Layers,
  Moon,
  Network,
  PackageOpen,
  Save,
  ShieldCheck,
  Sun,
  Workflow,
  Component,
  Code2,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ARCHITECTURAL_PATTERNS, ARCHITECTURAL_STYLES } from '@/data/architecture';
import { CATEGORIES, COMPONENT_TYPES } from '@/data/componentCatalog';
import { CONNECTION_KINDS } from '@/data/connectionCatalog';
import { REPOS } from '@/data/links';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useTheme';
import { BuildDemo } from './demos/BuildDemo';
import { DocDemo } from './demos/DocDemo';
import { DrillDemo } from './demos/DrillDemo';
import { StylesDemo } from './demos/StylesDemo';
import { GithubMark } from './GithubMark';
import { GithubMenu } from './GithubMenu';
import { BACKEND_INFO, FRONTEND_INFO } from './repoInfo';
import { HeroPreview } from './HeroPreview';
import { useInView, usePrefersReducedMotion } from './hooks';
import { Reveal } from './Reveal';
import { LandingRoot } from './landing.styles';

const DEMOS = [
  { id: 'build', label: 'Montar um diagrama', node: <BuildDemo /> },
  { id: 'styles', label: 'Estilos e padrões', node: <StylesDemo /> },
  { id: 'drill', label: 'Do macro ao detalhe', node: <DrillDemo /> },
  { id: 'docs', label: 'Documentação', node: <DocDemo /> },
] as const;

function Brand() {
  return (
    <span className="l-brand">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
        <rect x="4" y="4" width="10" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <rect x="18" y="20" width="10" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <path d="M9 12v4h14v4" fill="none" stroke="currentColor" strokeWidth="2.2" />
      </svg>
      archdraw
    </span>
  );
}

function CountUp({ to }: { to: number }) {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!inView || reduced) {
      if (reduced) setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to]);
  return <span ref={ref}>{v}</span>;
}

interface Feature {
  icon: ReactNode;
  title: string;
  text: string;
}

const FEATURES: Feature[] = [
  { icon: <Workflow size={18} />, title: 'Editor visual de diagramas', text: `Canvas com ${COMPONENT_TYPES.length} tipos de componente em ${CATEGORIES.length} categorias, arrastar e soltar, alinhamento, grid, minimapa, desfazer e refazer.` },
  { icon: <Cable size={18} />, title: 'Conexões semânticas', text: `${CONNECTION_KINDS.length} tipos de conexão — HTTP, gRPC, eventos, filas, acesso a dados — com sincronia, direção e protocolo.` },
  { icon: <Layers size={18} />, title: 'Estilos e padrões', text: `${ARCHITECTURAL_STYLES.length} estilos e ${ARCHITECTURAL_PATTERNS.length} padrões arquiteturais como conceitos distintos, com regras de combinação.` },
  { icon: <Network size={18} />, title: 'Do macro ao detalhe', text: 'Vincule um componente a outro diagrama e navegue de Contexto a Contêineres e à arquitetura interna.' },
  { icon: <FileText size={18} />, title: 'README por diagrama', text: 'Documentação em Markdown ao lado do canvas, com pré-visualização ao vivo e exportação.' },
  { icon: <Component size={18} />, title: 'Componentes reutilizáveis', text: 'Salve um componente no projeto e reaproveite-o em vários diagramas com as mesmas propriedades.' },
  { icon: <Code2 size={18} />, title: 'Diagramas de classe', text: 'Nós de linguagem com atributos e métodos, e cardinalidade nas relações.' },
  { icon: <PackageOpen size={18} />, title: 'Exportar e importar', text: 'Exporte diagramas como imagem, README ou projeto completo e importe de volta em outra conta.' },
  { icon: <Save size={18} />, title: 'Salvamento seguro', text: 'Controle de versão otimista com aviso de conflito e recuperação de rascunho se a conexão cair.' },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { settings, update } = useSettings();
  const reduced = usePrefersReducedMotion();
  const [demo, setDemo] = useState<(typeof DEMOS)[number]['id']>('build');
  const app = isAuthenticated ? '/dashboard' : '/login';
  const appLabel = isAuthenticated ? 'Abrir meu dashboard' : 'Acessar o sistema';
  const dark = settings.theme === 'dark';

  useEffect(() => {
    const prev = document.title;
    document.title = 'Archdraw — Modele, documente e navegue pela arquitetura de software';
    return () => {
      document.title = prev;
    };
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    const i = DEMOS.findIndex((d) => d.id === demo);
    const next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const d = DEMOS[(next + DEMOS.length) % DEMOS.length];
    setDemo(d.id);
    document.getElementById(`tab-${d.id}`)?.focus();
  };

  return (
    <LandingRoot>
      <a className="skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="l-header">
        <div className="l-wrap l-header-in">
          <Link to="/" className="l-brand-link" aria-label="Archdraw — início">
            <Brand />
          </Link>
          <nav className="l-nav" aria-label="Seções">
            <a href="#demo" onClick={go('demo')}>Demonstração</a>
            <a href="#recursos" onClick={go('recursos')}>Recursos</a>
            <a href="#open-source" onClick={go('open-source')}>Open source</a>
          </nav>
          <div className="l-actions">
            <button className="icon-btn" onClick={() => update({ theme: dark ? 'light' : 'dark' })} aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'} title="Alternar tema">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <span className="l-hide-sm">
              <GithubMenu label="GitHub" className="btn btn-sm" align="right" />
            </span>
            <Link className="btn btn-sm btn-primary" to={app}>
              {isAuthenticated ? 'Dashboard' : 'Entrar'}
            </Link>
          </div>
        </div>
      </header>

      <main id="conteudo">
        <section className="l-hero">
          <div className="l-wrap">
            <div className="l-hero-copy">
              <a className="l-pill" href="#open-source" onClick={go('open-source')}>
                <GitFork size={13} aria-hidden /> Open source · frontend e backend no GitHub <ArrowRight size={13} aria-hidden />
              </a>
              <h1>
                Desenhe a arquitetura.
                <br />
                <span>Documente a decisão.</span>
              </h1>
              <p className="l-lead">
                Diagramas de arquitetura costumam viver em slides desatualizados e imagens soltas. O Archdraw reúne modelagem
                semântica, estilos e padrões arquiteturais e um README por diagrama — do contexto do sistema ao detalhe de cada serviço.
              </p>
              <div className="l-cta">
                <Link className="btn btn-primary btn-lg" to={app}>
                  {appLabel} <ArrowRight size={16} aria-hidden />
                </Link>
                <GithubMenu label="Ver código no GitHub" className="btn btn-lg" />
              </div>
              <ul className="l-facts mono">
                <li>React 19 + React Flow</li>
                <li>.NET 8 · PostgreSQL</li>
              </ul>
            </div>
            <Reveal className="l-hero-preview" delay={120}>
              <HeroPreview />
            </Reveal>
          </div>
        </section>

        <section className="l-section" id="demo" aria-labelledby="demo-t">
          <div className="l-wrap">
            <Reveal className="l-head">
              <p className="l-kicker mono">Demonstração interativa</p>
              <h2 id="demo-t">Experimente sem criar conta</h2>
              <p className="l-sub">Simulações com dados fictícios, que rodam só no seu navegador. Clique, selecione, navegue — nada é salvo.</p>
            </Reveal>

            <div className="l-tabs" role="tablist" aria-label="Demonstrações" onKeyDown={onTabKey}>
              {DEMOS.map((d) => (
                <button key={d.id} id={`tab-${d.id}`} role="tab" aria-selected={demo === d.id} aria-controls={`panel-${d.id}`} tabIndex={demo === d.id ? 0 : -1} className={demo === d.id ? 'on' : ''} onClick={() => setDemo(d.id)}>
                  {d.label}
                </button>
              ))}
            </div>
            {DEMOS.map((d) => (
              <div key={d.id} id={`panel-${d.id}`} role="tabpanel" aria-labelledby={`tab-${d.id}`} hidden={demo !== d.id} className="l-panel">
                {demo === d.id && d.node}
              </div>
            ))}
          </div>
        </section>

        <section className="l-section l-alt" id="recursos" aria-labelledby="rec-t">
          <div className="l-wrap">
            <Reveal className="l-head">
              <p className="l-kicker mono">Recursos</p>
              <h2 id="rec-t">O que já está implementado</h2>
              <p className="l-sub">Tudo abaixo existe hoje no editor e na API — sem promessas de roadmap.</p>
            </Reveal>
            <ul className="l-stats">
              {[
                [COMPONENT_TYPES.length, 'componentes'],
                [CONNECTION_KINDS.length, 'tipos de conexão'],
                [ARCHITECTURAL_STYLES.length, 'estilos'],
                [ARCHITECTURAL_PATTERNS.length, 'padrões'],
              ].map(([n, l]) => (
                <li key={l as string}>
                  <b className="mono"><CountUp to={n as number} /></b>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
            <div className="l-grid">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} as="article" className="l-card" delay={(i % 3) * 70}>
                  <span className="l-ico">{f.icon}</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="l-section" id="open-source" aria-labelledby="os-t">
          <div className="l-wrap">
            <Reveal className="l-head">
              <p className="l-kicker mono">Open source</p>
              <h2 id="os-t">Código aberto, de ponta a ponta</h2>
              <p className="l-sub">Frontend e backend são repositórios públicos separados no GitHub. Explore a implementação, abra issues e contribua.</p>
            </Reveal>
            <div className="l-repos">
              {[
                { info: FRONTEND_INFO, url: REPOS.frontend, label: 'frontend' },
                { info: BACKEND_INFO, url: REPOS.backend, label: 'backend' },
              ].map(({ info, url, label }, i) => (
                <Reveal key={info.name} as="div" className="l-repo" delay={i * 80}>
                  <div className="l-repo-card">
                    <a className="l-repo-top" href={url} target="_blank" rel="noreferrer noopener" aria-label={`Repositório do ${label} no GitHub (abre em nova aba)`}>
                      <GithubMark size={18} />
                      <span className="mono">{info.name}</span>
                      <ArrowUpRight size={16} aria-hidden />
                    </a>
                    <p>{info.summary}</p>
                    {info.groups.map((g) => (
                      <div key={g.title} className="l-group">
                        <h3 className="mono">{g.title}</h3>
                        <ul className={`l-tags mono ${g.kind ?? ''}`}>
                          {g.items.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="l-license"><ShieldCheck size={15} aria-hidden /> Os repositórios ainda não declaram uma licença. Consulte-os no GitHub para os termos de uso e de contribuição antes de reutilizar o código.</p>
          </div>
        </section>

        <section className="l-final" aria-labelledby="fim-t">
          <div className="l-wrap">
            <Reveal className="l-final-in">
              <Boxes size={26} aria-hidden className="l-final-ico" />
              <h2 id="fim-t">Sua próxima arquitetura começa num canvas em branco</h2>
              <p className="l-sub">Crie uma conta, carregue o projeto de exemplo de e-commerce e explore — ou leia o código para ver como tudo funciona.</p>
              <div className="l-cta center">
                <Link className="btn btn-primary btn-lg" to={app}>{appLabel} <ArrowRight size={16} aria-hidden /></Link>
                {!isAuthenticated && <Link className="btn btn-lg" to="/register">Criar conta</Link>}
                <GithubMenu label="Código no GitHub" className="btn btn-lg" up />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="l-footer">
        <div className="l-wrap l-footer-in">
          <Brand />
          <span className="small muted">Projeto open source · modelagem de arquitetura de software</span>
          <nav aria-label="Links do rodapé" className="l-foot-links">
            <a href={REPOS.frontend} target="_blank" rel="noreferrer noopener">Frontend</a>
            <a href={REPOS.backend} target="_blank" rel="noreferrer noopener">Backend</a>
            <Link to={app}>{isAuthenticated ? 'Dashboard' : 'Entrar'}</Link>
          </nav>
        </div>
      </footer>
    </LandingRoot>
  );
}
