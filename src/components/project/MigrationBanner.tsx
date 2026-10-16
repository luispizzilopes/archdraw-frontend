import { DatabaseBackup, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { useLocalMigration, type MigrationItem } from '@/hooks/useLocalMigration';
import { Banner, ItemList, Row } from './MigrationBanner.styles';

const LABEL: Record<MigrationItem['state'], string> = {
  pending: 'Aguardando',
  running: 'Importando…',
  imported: 'Importado',
  already: 'Já estava na conta',
  failed: 'Falhou',
};

export function MigrationBanner({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const toast = useToast();
  const m = useLocalMigration();
  const [confirmClear, setConfirmClear] = useState(false);

  if (m.phase === 'scanning' || m.phase === 'none') return null;
  if (m.dismissed && !alwaysShow && m.phase !== 'done') return null;

  return (
    <Banner role="region" aria-label="Migração de dados locais">
      <DatabaseBackup size={20} />
      <div>
        <strong>
          {m.phase === 'done' ? 'Migração concluída' : `Encontramos ${m.items.length} projeto(s) salvos apenas neste navegador`}
        </strong>
        <p className="muted small">
          {m.phase === 'done'
            ? 'Seus dados locais continuam intactos neste navegador. Apague-os apenas quando tiver conferido o resultado.'
            : 'Importe-os para a sua conta para acessá-los de qualquer lugar. Reimportar é seguro: nada é duplicado e os dados locais não são apagados.'}
        </p>
        {m.unsupported && (
          <p className="small" role="alert">
            A versão do banco local é mais nova do que a suportada; a importação pode ser parcial.
          </p>
        )}
        {m.skipped > 0 && <p className="small">{m.skipped} registro(s) em formato inesperado foram ignorados.</p>}

        <ItemList>
          {m.items.map((i) => (
            <Row key={i.legacyId} $state={i.state}>
              <span>{i.name}</span>
              <span>
                {LABEL[i.state]}
                {i.result &&
                  i.state === 'imported' &&
                  ` · ${i.result.diagrams} diagrama(s), ${i.result.nodes} componente(s), ${i.result.documents} documento(s)`}
                {i.error && ` · ${i.error}`}
              </span>
              {!!i.result?.warnings.length && <small title={i.result.warnings.join('\n')}>{i.result.warnings.length} aviso(s)</small>}
            </Row>
          ))}
        </ItemList>

        <div className="row" style={{ marginTop: 10 }}>
          {m.phase !== 'done' && (
            <>
              <button className="btn btn-primary btn-sm" disabled={m.phase === 'running'} onClick={() => void m.migrate()}>
                {m.phase === 'running' ? 'Importando…' : 'Importar para minha conta'}
              </button>
              <button className="btn btn-sm" disabled={m.phase === 'running'} onClick={m.dismiss}>
                Agora não
              </button>
            </>
          )}
          {m.phase === 'done' && !m.allConfirmed && (
            <button className="btn btn-primary btn-sm" onClick={() => void m.migrate()}>
              Tentar novamente os que falharam
            </button>
          )}
          {m.allConfirmed && (
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmClear(true)}>
              <Trash2 size={13} />
              Apagar dados locais
            </button>
          )}
        </div>
      </div>
      {confirmClear && (
        <ConfirmDialog
          danger
          title="Apagar dados locais"
          confirmLabel="Apagar deste navegador"
          message="Os projetos já estão na sua conta. Isso remove apenas a cópia antiga guardada neste navegador. Não há como desfazer."
          onClose={() => setConfirmClear(false)}
          onConfirm={async () => {
            await m.clearLocal();
            toast('Dados locais removidos deste navegador.');
          }}
        />
      )}
    </Banner>
  );
}
