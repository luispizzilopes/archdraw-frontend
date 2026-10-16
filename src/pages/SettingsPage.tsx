import { Moon, Sparkles, Sun } from 'lucide-react';
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

      <section className="panel">
        <h3>Aparência</h3>
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

      <section className="panel">
        <h3>Novos diagramas</h3>
        <label className="check">
          <input type="checkbox" checked={settings.defaultShowGrid} onChange={(e) => update({ defaultShowGrid: e.target.checked })} />
          Exibir grid
        </label>
        <label className="check">
          <input type="checkbox" checked={settings.defaultSnapToGrid} onChange={(e) => update({ defaultSnapToGrid: e.target.checked })} />
          Alinhar ao grid (snap)
        </label>
      </section>

      <section className="panel">
        <h3>Dados</h3>
        <p className="muted small">Seus projetos ficam na sua conta. Use a exportação em JSON de cada projeto para backups.</p>
        <div className="row">
          <button className="btn" disabled={loadExample.loading} onClick={() => void openExample()}>
            <Sparkles size={15} />
            Carregar projeto de exemplo
          </button>
        </div>
      </section>

      <MigrationBanner alwaysShow />
    </div>
  );
}
