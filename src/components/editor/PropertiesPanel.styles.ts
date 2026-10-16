import styled from 'styled-components';

export const SharedBanner = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 4px 8px;
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-2);
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--border));
  border-radius: 8px;

  > button {
    grid-column: 1 / -1;
    justify-self: start;
  }
`;
