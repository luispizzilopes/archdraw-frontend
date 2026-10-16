import type { Point } from '@/types';

export function roundedPolyline(pts: Point[], radius = 10): { path: string; mid: Point } {
  const clean = pts.filter((p, i) => i === 0 || p.x !== pts[i - 1].x || p.y !== pts[i - 1].y);
  if (clean.length < 2) return { path: '', mid: clean[0] ?? { x: 0, y: 0 } };
  let d = `M ${clean[0].x} ${clean[0].y}`;
  for (let i = 1; i < clean.length - 1; i++) {
    const a = clean[i - 1],
      b = clean[i],
      c = clean[i + 1];
    const l1 = Math.hypot(b.x - a.x, b.y - a.y);
    const l2 = Math.hypot(c.x - b.x, c.y - b.y);
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const p1 = { x: b.x - ((b.x - a.x) / l1) * r, y: b.y - ((b.y - a.y) / l1) * r };
    const p2 = { x: b.x + ((c.x - b.x) / l2) * r, y: b.y + ((c.y - b.y) / l2) * r };
    d += ` L ${p1.x} ${p1.y} Q ${b.x} ${b.y} ${p2.x} ${p2.y}`;
  }
  const last = clean[clean.length - 1];
  d += ` L ${last.x} ${last.y}`;

  const lens = clean.slice(1).map((p, i) => Math.hypot(p.x - clean[i].x, p.y - clean[i].y));
  let half = lens.reduce((s, l) => s + l, 0) / 2;
  let mid = clean[0];
  for (let i = 0; i < lens.length; i++) {
    if (half <= lens[i] || i === lens.length - 1) {
      const t = lens[i] ? half / lens[i] : 0;
      mid = { x: clean[i].x + (clean[i + 1].x - clean[i].x) * t, y: clean[i].y + (clean[i + 1].y - clean[i].y) * t };
      break;
    }
    half -= lens[i];
  }
  return { path: d, mid };
}

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

function midOf(pts: Point[]): Point {
  const total = pts.slice(1).reduce((s, p, i) => s + dist(pts[i], p), 0);
  let half = total / 2;
  for (let i = 1; i < pts.length; i++) {
    const l = dist(pts[i - 1], pts[i]);
    if (half <= l || i === pts.length - 1) {
      const t = l ? half / l : 0;
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t };
    }
    half -= l;
  }
  return pts[0];
}

export function orthogonalRoute(
  route: Point[],
  startHorizontal: boolean,
  endHorizontal: boolean,
): { points: Point[]; segmentMids: Point[] } {
  const points: Point[] = [route[0]];
  const segmentMids: Point[] = [];
  let horizontalFirst = startHorizontal;
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1];
    const b = route[i];
    const last = i === route.length - 1;
    const hf = last ? !endHorizontal : horizontalFirst;
    const seg: Point[] = [a];
    if (a.x !== b.x && a.y !== b.y) seg.push(hf ? { x: b.x, y: a.y } : { x: a.x, y: b.y });
    seg.push(b);
    points.push(...seg.slice(1));
    segmentMids.push(midOf(seg));
    const lastLegHorizontal = seg.length === 3 ? hf === false : a.y === b.y;
    horizontalFirst = !lastLegHorizontal;
  }
  return { points, segmentMids };
}
