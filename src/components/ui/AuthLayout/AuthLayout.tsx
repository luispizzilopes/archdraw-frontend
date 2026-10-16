import type { ReactNode } from 'react';
import { Brand, Card, Footer, Page, Subtitle, Title } from './AuthLayout.styles';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <Page>
      <Card>
        <Brand>
          <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
            <rect x="4" y="4" width="10" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <rect x="18" y="20" width="10" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="M9 12v4h14v4" fill="none" stroke="currentColor" strokeWidth="2.2" />
          </svg>
          <span>archdraw</span>
        </Brand>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        {children}
        {footer && <Footer>{footer}</Footer>}
      </Card>
    </Page>
  );
}
