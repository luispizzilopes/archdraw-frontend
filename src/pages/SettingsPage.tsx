import { Database, Grid3x3, Moon, Palette, Sparkles, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MigrationBanner } from '@/components/project/MigrationBanner';
import { useToast } from '@/components/ui/Toast';
import { useLoadExampleProject } from '@/hooks/useLoadExampleProject';
import { useSettings } from '@/hooks/useTheme';

export function SettingsPage() {
  const { settings, update } = useSettings();
  const nav = useNavigate();
  const toast = useToast();
  const loadExample = useLoadExampleProject();

  const openExample = async () => {
    try {
      const result = await loadExample.execute();
      toast('Exemplo carregado.', 'success');
      nav(`/projects/${result.projectId}`);
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return (
    <div className="page narrow">
      <header className="page-head">
        <div>
          <h1>Configurações</h1>
          <p className="muted">Preferências de interface deste navegador.</p>
        </div>
      </header>

      <section className="panel stretch">
        <div className="panel-head">
          <span className="panel-icon"><Palette size={16} /></span>
          <div>
            <h3>Aparência</h3>
            <p className="muted small">Escolha o tema da interface.</p>
          </div>
        </div>
        <div className="segmented">
          <button className={settings.theme === 'dark' ? 'on' : ''} onClick={() => update({ theme: 'dark' })}>
            <Moon size={14} />
            Escuro
          </button>
          <button className={settings.theme === 'light' ? 'on' : ''} onClick={() => update({ theme: 'light' })}>
            <Sun size={14} />
            Claro
          </button>
        </div>
      </section>

      <section className="panel stretch">
        <div className="panel-head">
          <span className="panel-icon"><Grid3x3 size={16} /></span>
          <div>
            <h3>Novos diagramas</h3>
            <p className="muted small">Valores iniciais aplicados ao criar um diagrama.</p>
          </div>
        </div>
        <div>
          <label className="setting-row">
            <span className="setting-text">
              Exibir grid
              <span className="muted">Mostra a grade de fundo no canvas.</span>
            </span>
            <input className="switch" type="checkbox" checked={settings.defaultShowGrid} onChange={(e) => update({ defaultShowGrid: e.target.checked })} />
          </label>
          <label className="setting-row">
            <span className="setting-text">
              Alinhar ao grid (snap)
              <span className="muted">Encaixa os componentes na grade ao arrastar.</span>
            </span>
            <input className="switch" type="checkbox" checked={settings.defaultSnapToGrid} onChange={(e) => update({ defaultSnapToGrid: e.target.checked })} />
          </label>
        </div>
      </section>

      <section className="panel stretch">
        <div className="panel-head">
          <span className="panel-icon"><Database size={16} /></span>
          <div>
            <h3>Dados</h3>
            <p className="muted small">Seus projetos ficam na sua conta. Use a exportação em JSON de cada projeto para backups.</p>
          </div>
        </div>
        <div className="setting-row" style={{ paddingBottom: 0 }}>
          <span className="setting-text">
            Projeto de exemplo
            <span className="muted">Carrega um sistema de E-commerce completo para explorar.</span>
          </span>
          <button className="btn" disabled={loadExample.loading} onClick={() => void openExample()}>
            <Sparkles size={15} />
            {loadExample.loading ? 'Carregando…' : 'Carregar'}
          </button>
        </div>
      </section>

      <MigrationBanner alwaysShow />
    </div>
  );
}
