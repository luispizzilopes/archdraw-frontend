import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownPreview({ source }: { source: string }) {
  return (
    <article className="md">
      {source.trim() ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: (p) => <a {...p} target="_blank" rel="noreferrer noopener" /> }}>
          {source}
        </ReactMarkdown>
      ) : (
        <p className="muted">Nada para visualizar ainda.</p>
      )}
    </article>
  );
}
