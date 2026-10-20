import { ChevronDown } from 'lucide-react';
import { Menu } from '@/components/ui/Menu';
import { REPOS } from '@/data/links';
import { GithubMark } from './GithubMark';

interface Props {
  label: string;
  className?: string;
  align?: 'left' | 'right';
  up?: boolean;
}

const open = (url: string) => () => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

/** Botão do GitHub que abre duas opções: repositório do frontend ou do backend. */
export function GithubMenu({ label, className = 'btn', align = 'left', up }: Props) {
  return (
    <Menu
      align={align}
      up={up}
      items={[
        { label: 'Frontend · archdraw-frontend', icon: <GithubMark size={14} />, onClick: open(REPOS.frontend) },
        { label: 'Backend · archdraw-backend', icon: <GithubMark size={14} />, onClick: open(REPOS.backend) },
      ]}
      trigger={({ open: isOpen, toggle }) => (
        <button type="button" className={className} onClick={toggle} aria-haspopup="menu" aria-expanded={isOpen}>
          <GithubMark size={className.includes('btn-lg') ? 16 : 14} /> {label}
          <ChevronDown size={14} aria-hidden className={`chev ${isOpen ? 'open' : ''}`} />
        </button>
      )}
    />
  );
}
