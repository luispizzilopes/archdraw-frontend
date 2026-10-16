import styled from 'styled-components';

export const Banner = styled.section`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 16px;
  margin-bottom: 20px;
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--border));
  border-radius: 10px;

  > svg {
    flex: none;
    margin-top: 2px;
    color: var(--accent-fg);
  }
  p {
    margin: 2px 0 0;
  }
`;

export const ItemList = styled.ul`
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: grid;
  gap: 4px;
`;

export const Row = styled.li<{ $state: string }>`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 12.5px;
  color: ${({ $state }) => ($state === 'failed' ? 'var(--danger)' : 'var(--text-2)')};

  span:first-child {
    color: var(--text);
    font-weight: 500;
  }
`;
