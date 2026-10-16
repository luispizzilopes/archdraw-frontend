import styled from 'styled-components';

export const ConflictBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  font-size: 12.5px;
  color: var(--text);
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
  border-bottom: 1px solid color-mix(in srgb, var(--danger) 40%, var(--border));

  span {
    flex: 1 1 260px;
  }
`;
