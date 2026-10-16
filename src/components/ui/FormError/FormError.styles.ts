import styled from 'styled-components';

export const Box = styled.div`
  margin: 4px 0 10px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger) 40%, var(--border));
  border-radius: 8px;
`;
