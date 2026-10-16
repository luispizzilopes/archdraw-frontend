import { ARCHITECTURAL_STYLES } from '@/data/architecture';

export function canCombineStyle(selected: string[], candidate: string): boolean {
  const c = ARCHITECTURAL_STYLES.find((s) => s.id === candidate);
  if (!c) return false;
  return selected.every((id) => id === candidate || !c.conflictsWith.includes(id));
}

export function toggleStyle(selected: string[], id: string): string[] {
  if (selected.includes(id)) return selected.filter((s) => s !== id);
  return canCombineStyle(selected, id) ? [...selected, id] : selected;
}

export function toggleItem(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
