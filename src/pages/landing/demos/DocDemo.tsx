import { FastForward, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { useInView, usePrefersReducedMotion } from '../hooks';

const SOURCE = `# Order Service

Responsável pelo **ciclo de vida do pedido**.

## Comunicação

| Origem | Destino | Tipo |
| --- | --- | --- |
| API Gateway | Order Service | HTTP |
| Order Service | Event Bus | \`OrderPlaced\` (async) |

## Decisões arquiteturais

- **Clean Architecture** isola o domínio da infraestrutura.
- Eventos publicados via **Outbox** para não perder mensagens.
`;

export function DocDemo() {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>();
  const [text, setText] = useState(reduced ? SOURCE : '');
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inView && !started && !reduced) {
      setStarted(true);
      setTyping(true);
    }
  }, [inView, started, reduced]);

  useEffect(() => {
    if (!typing) return;
    if (text.length >= SOURCE.length) {
      setTyping(false);
      return;
    }
    const t = setTimeout(() => setText(SOURCE.slice(0, Math.min(SOURCE.length, text.length + 3))), 24);
    return () => clearTimeout(t);
  }, [typing, text]);

  useEffect(() => {
    if (typing && area.current) area.current.scrollTop = area.current.scrollHeight;
  }, [text, typing]);

  const restart = () => {
    setText('');
    setTyping(!reduced);
    if (reduced) setText(SOURCE);
  };

  return (
    <div className="demo" ref={ref}>
      <div className="demo-bar">
        <p className="demo-bar-text">Cada diagrama tem seu README em Markdown, com pré-visualização ao vivo. Depois de digitado, edite o texto à vontade.</p>
        <div className="demo-ctrl">
          <button className="btn btn-sm" onClick={() => { setTyping(false); setText(SOURCE); }} disabled={text === SOURCE}>
            <FastForward size={13} /> Concluir
          </button>
          <button className="btn btn-sm btn-ghost" onClick={restart}>
            <RotateCcw size={13} /> Reiniciar
          </button>
        </div>
      </div>
      <div className="demo-window doc">
        <div className="doc-col">
          <div className="panel-title">README.md {typing && <span className="caret-tag">digitando…</span>}</div>
          <textarea
            ref={area}
            className="md-input"
            value={text}
            readOnly={typing}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label="Editor Markdown da demonstração"
          />
        </div>
        <div className="doc-col preview">
          <div className="panel-title">Pré-visualização</div>
          <div className="md-preview">
            <MarkdownPreview source={text} />
          </div>
        </div>
      </div>
    </div>
  );
}
