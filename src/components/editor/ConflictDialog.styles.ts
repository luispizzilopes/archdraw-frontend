import styled from 'styled-components';

export const OptionList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 14px;
`;

export const Option = styled.button`
  display: grid;
  gap: 2px;
  text-align: left;
  padding: 10px 12px;
  font: inherit;
  color: var(--text);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;

  span {
    font-size: 12.5px;
    color: var(--text-2);
  }
  &:hover:not(:disabled) {
    border-color: var(--accent);
  }
  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
`;
