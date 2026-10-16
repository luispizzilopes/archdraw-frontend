import type { Point } from '@/types';

export interface Box {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AlignMode = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeAxis = 'horizontal' | 'vertical';

export function align(boxes: Box[], mode: AlignMode): Map<string, Point> {
  const out = new Map<string, Point>();
  if (boxes.length < 2) return out;
  const minX = Math.min(...boxes.map((b) => b.x));
  const maxX = Math.max(...boxes.map((b) => b.x + b.w));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxY = Math.max(...boxes.map((b) => b.y + b.h));
  for (const b of boxes) {
    let { x, y } = b;
    if (mode === 'left') x = minX;
    if (mode === 'right') x = maxX - b.w;
    if (mode === 'center') x = (minX + maxX) / 2 - b.w / 2;
    if (mode === 'top') y = minY;
    if (mode === 'bottom') y = maxY - b.h;
    if (mode === 'middle') y = (minY + maxY) / 2 - b.h / 2;
    out.set(b.id, { x, y });
  }
  return out;
}

export function distribute(boxes: Box[], axis: DistributeAxis): Map<string, Point> {
  const out = new Map<string, Point>();
  if (boxes.length < 3) return out;
  const horizontal = axis === 'horizontal';
  const sorted = [...boxes].sort((a, b) => (horizontal ? a.x - b.x : a.y - b.y));
  const size = (b: Box) => (horizontal ? b.w : b.h);
  const start = horizontal ? sorted[0].x : sorted[0].y;
  const last = sorted[sorted.length - 1];
  const end = (horizontal ? last.x : last.y) + size(last);
  const total = sorted.reduce((s, b) => s + size(b), 0);
  const gap = (end - start - total) / (sorted.length - 1);
  let cursor = start;
  for (const b of sorted) {
    out.set(b.id, horizontal ? { x: cursor, y: b.y } : { x: b.x, y: cursor });
    cursor += size(b) + gap;
  }
  return out;
}
