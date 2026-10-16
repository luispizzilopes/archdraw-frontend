import styled from 'styled-components';

export const Page = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 16px;
  background:
    radial-gradient(circle at 1px 1px, var(--grid-dot) 1px, transparent 0) 0 0 / 22px 22px,
    var(--bg);
`;

export const Card = styled.section`
  width: min(100%, 400px);
  padding: 28px 28px 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--accent-fg);
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 20px;
`;

export const Subtitle = styled.p`
  margin: 6px 0 18px;
  font-size: 13.5px;
  color: var(--text-2);
`;

export const Footer = styled.div`
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-2);
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  justify-content: space-between;

  a {
    color: var(--accent-fg);
  }
`;
