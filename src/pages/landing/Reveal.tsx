import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from './hooks';

interface Props {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}

/** Entrada suave ao rolar; sem movimento quando o usuário pede `prefers-reduced-motion` (via CSS). */
export function Reveal({ children, as: Tag = 'div', delay = 0, className = '' }: Props) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} className={`reveal ${inView ? 'in' : ''} ${className}`} style={{ ['--d' as string]: `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
