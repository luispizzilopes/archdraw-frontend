import { getPattern, getStyle } from '@/data/architecture';

export function StyleBadges({ styleIds = [], patternIds = [], primary }: { styleIds?: string[]; patternIds?: string[]; primary?: string }) {
  const styles = primary ? [primary, ...styleIds.filter((s) => s !== primary)] : styleIds;
  return (
    <div className="badges">
      {styles.map((id, i) => (
        <span key={id} className={`badge badge-style ${primary && i === 0 ? 'primary' : ''}`} title="Estilo arquitetural">
          {getStyle(id)?.short ?? id}
        </span>
      ))}
      {patternIds.map((id) => (
        <span key={id} className="badge badge-pattern" title="Padrão arquitetural">
          {getPattern(id)?.short ?? id}
        </span>
      ))}
    </div>
  );
}
