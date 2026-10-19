import { describe, expect, it } from 'vitest';
import { ARCHITECTURAL_PATTERNS, ARCHITECTURAL_STYLES } from '@/data/architecture';
import { TEMPLATES } from '@/domain/templates';

describe('templates', () => {
  it('oferece um exemplo para cada estilo e cada padrão arquitetural', () => {
    for (const s of ARCHITECTURAL_STYLES) {
      expect(
        TEMPLATES.some((t) => t.group === 'style' && t.styleIds.includes(s.id)),
        s.id,
      ).toBe(true);
    }
    for (const p of ARCHITECTURAL_PATTERNS) {
      expect(
        TEMPLATES.some((t) => t.group === 'pattern' && t.patternIds.includes(p.id)),
        p.id,
      ).toBe(true);
    }
  });

  it('constrói todos os templates sem erro, com ids únicos', () => {
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    for (const t of TEMPLATES) {
      const built = t.build();
      const ids = new Set(built.nodes.map((n) => n.id));
      expect(
        built.edges.every((e) => ids.has(e.source) && ids.has(e.target)),
        t.id,
      ).toBe(true);
    }
  });
});
