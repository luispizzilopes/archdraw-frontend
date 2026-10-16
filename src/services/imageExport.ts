import { getNodesBounds } from '@xyflow/react';
import { toPng, toSvg } from 'html-to-image';
import type { Node } from '@xyflow/react';

const PAD = 48;

async function render(kind: 'png' | 'svg', nodes: Node[]): Promise<string> {
  const viewport = document.querySelector<HTMLElement>('.react-flow__viewport');
  const root = document.querySelector<HTMLElement>('.react-flow');
  if (!viewport || !root) throw new Error('Canvas indisponível.');
  if (nodes.length === 0) throw new Error('O diagrama está vazio.');

  const b = getNodesBounds(nodes);
  const width = Math.ceil(b.width + PAD * 2);
  const height = Math.ceil(b.height + PAD * 2);
  const bg = getComputedStyle(root).getPropertyValue('--canvas-bg').trim() || '#101216';

  root.classList.add('exporting');
  try {
    const opts = {
      backgroundColor: bg,
      width,
      height,
      pixelRatio: 2,
      fontEmbedCSS: '',
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${-b.x + PAD}px, ${-b.y + PAD}px) scale(1)`,
      },
    };
    return kind === 'png' ? await toPng(viewport, opts) : await toSvg(viewport, opts);
  } finally {
    root.classList.remove('exporting');
  }
}

export const imageExport = {
  png: (nodes: Node[]) => render('png', nodes),
  svg: (nodes: Node[]) => render('svg', nodes),
};
