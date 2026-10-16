import { ARCHITECTURAL_PATTERNS, ARCHITECTURAL_STYLES } from '@/data/architecture';
import { canCombineStyle, toggleItem, toggleStyle } from '@/domain/architecture';

interface Props {
  styleIds: string[];
  patternIds?: string[];
  onStyles: (ids: string[]) => void;
  onPatterns?: (ids: string[]) => void;
  showPrimaryHint?: boolean;
}

export function ArchitecturePicker({ styleIds, patternIds, onStyles, onPatterns, showPrimaryHint }: Props) {
  return (
    <div className="arch-picker">
      <div>
        <div className="field-label">Estilos arquiteturais</div>
        <div className="chips">
          {ARCHITECTURAL_STYLES.map((s) => {
            const on = styleIds.includes(s.id);
            const blocked = !on && !canCombineStyle(styleIds, s.id);
            return (
              <button
                type="button"
                key={s.id}
                className={`chip ${on ? 'on' : ''}`}
                disabled={blocked}
                title={blocked ? 'Não combina com um estilo já selecionado' : s.summary}
                onClick={() => onStyles(toggleStyle(styleIds, s.id))}
              >
                {s.short}
                {on && showPrimaryHint && styleIds[0] === s.id && <em>principal</em>}
              </button>
            );
          })}
        </div>
        {showPrimaryHint && <div className="field-hint">O primeiro selecionado é o estilo principal.</div>}
      </div>
      {patternIds && onPatterns && (
        <div>
          <div className="field-label">Padrões arquiteturais</div>
          <div className="chips">
            {ARCHITECTURAL_PATTERNS.map((p) => (
              <button
                type="button"
                key={p.id}
                className={`chip chip-pattern ${patternIds.includes(p.id) ? 'on' : ''}`}
                title={p.summary}
                onClick={() => onPatterns(toggleItem(patternIds, p.id))}
              >
                {p.short}
              </button>
            ))}
          </div>
          <div className="field-hint">Estilo e padrão coexistem: um padrão descreve a organização interna.</div>
        </div>
      )}
    </div>
  );
}
