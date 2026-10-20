import { Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArchitecturePicker } from '@/components/ui/ArchitecturePicker';
import { ARCHITECTURAL_STYLES, getPattern, getStyle, PATTERN_IDS, STYLE_IDS } from '@/data/architecture';
import { canCombineStyle } from '@/domain/architecture';
import { usePrefersReducedMotion } from '../hooks';

interface Frame {
  styles: string[];
  patterns: string[];
  note: string;
}

const TOUR: Frame[] = [
  { styles: [], patterns: [], note: 'Nenhum estilo escolhido: todas as opções estão disponíveis.' },
  { styles: [STYLE_IDS.microservices], patterns: [], note: 'Microsserviços selecionado. Monolito, SOA e Service-Based passam a ficar bloqueados — não combinam.' },
  { styles: [STYLE_IDS.microservices, STYLE_IDS.eventDriven], patterns: [], note: 'Orientado a Eventos combina com Microsserviços, então é aceito como estilo secundário.' },
  { styles: [STYLE_IDS.microservices, STYLE_IDS.eventDriven], patterns: [PATTERN_IDS.clean], note: 'Padrões são outro eixo: Clean Architecture descreve a organização interna dos serviços.' },
  { styles: [STYLE_IDS.microservices, STYLE_IDS.eventDriven], patterns: [PATTERN_IDS.clean, PATTERN_IDS.cqrs, PATTERN_IDS.outbox], note: 'Vários padrões podem coexistir no mesmo projeto.' },
];

export function StylesDemo() {
  const reduced = usePrefersReducedMotion();
  const [styles, setStyles] = useState<string[]>([STYLE_IDS.microservices]);
  const [patterns, setPatterns] = useState<string[]>([PATTERN_IDS.clean]);
  const [note, setNote] = useState('Experimente: clique nos estilos e veja quais deixam de combinar.');
  const [touring, setTouring] = useState(false);
  const timers = useRef<number[]>([]);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTouring(false);
  };
  useEffect(() => stop, []);

  const apply = (f: Frame) => {
    setStyles(f.styles);
    setPatterns(f.patterns);
    setNote(f.note);
  };

  const play = () => {
    stop();
    if (reduced) {
      apply(TOUR[TOUR.length - 1]);
      return;
    }
    setTouring(true);
    TOUR.forEach((f, i) => {
      timers.current.push(window.setTimeout(() => apply(f), i * 2400));
    });
    timers.current.push(window.setTimeout(() => setTouring(false), TOUR.length * 2400));
  };

  const blocked = useMemo(() => ARCHITECTURAL_STYLES.filter((s) => !styles.includes(s.id) && !canCombineStyle(styles, s.id)), [styles]);

  return (
    <div className="demo">
      <div className="demo-bar">
        <p className="demo-bar-text">Estilo e padrão são conceitos distintos — e o editor impede combinações incoerentes.</p>
        <div className="demo-ctrl">
          <button className="btn btn-sm" onClick={play} disabled={touring}>
            <Play size={13} /> {touring ? 'Reproduzindo…' : 'Ver exemplo guiado'}
          </button>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              stop();
              apply({ styles: [], patterns: [], note: 'Seleção limpa.' });
            }}
          >
            <RotateCcw size={13} /> Limpar
          </button>
        </div>
      </div>

      <div className="demo-split">
        <div className="demo-pane padded" onClickCapture={() => touring && stop()}>
          <ArchitecturePicker
            styleIds={styles}
            patternIds={patterns}
            onStyles={(s) => {
              setStyles(s);
              setNote('');
            }}
            onPatterns={(p) => {
              setPatterns(p);
              setNote('');
            }}
            showPrimaryHint
          />
        </div>
        <div className="demo-pane padded summary">
          <div className="field-label">Resumo do projeto</div>
          <div key={styles.join() + patterns.join()} className="summary-body">
            {styles.length ? (
              styles.map((id, i) => (
                <div key={id} className="summary-item">
                  <span className={`badge badge-style ${i === 0 ? 'primary' : ''}`}>{getStyle(id)?.short}</span>
                  <p>{getStyle(id)?.summary}</p>
                </div>
              ))
            ) : (
              <p className="muted">Escolha ao menos um estilo para o projeto.</p>
            )}
            {patterns.map((id) => (
              <div key={id} className="summary-item">
                <span className="badge badge-pattern">{getPattern(id)?.short}</span>
                <p>{getPattern(id)?.summary}</p>
              </div>
            ))}
          </div>
          <div className="summary-foot" aria-live="polite">
            {blocked.length > 0 && (
              <p className="small muted">
                <strong>{blocked.length}</strong> {blocked.length === 1 ? 'estilo bloqueado' : 'estilos bloqueados'}: {blocked.map((b) => b.short).join(', ')}.
              </p>
            )}
            {note && <p className="demo-note">{note}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
