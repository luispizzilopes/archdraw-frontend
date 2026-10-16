import { getIcon } from '@/components/ui/iconMap';
import { TEMPLATES, TEMPLATE_GROUPS } from '@/domain/templates';

export function TemplatePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="tpl-picker">
      {TEMPLATE_GROUPS.map((g) => (
        <section key={g.id}>
          <div className="field-label">{g.label}</div>
          <div className="tpl-grid">
            {TEMPLATES.filter((t) => t.group === g.id).map((t) => {
              const Icon = getIcon(t.icon);
              return (
                <button type="button" key={t.id} className={`tpl-card ${value === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)}>
                  <Icon size={18} />
                  <strong>{t.name}</strong>
                  <span>{t.description}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
