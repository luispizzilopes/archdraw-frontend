import styled, { css } from 'styled-components';
import type { SaveStatus } from '@/types';

const dot = (color: string, pulse = false) => css`
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    background: ${color};
    ${pulse && 'animation: pulse 1s infinite;'}
  }
`;

export const Chip = styled.span<{ $status: SaveStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  white-space: nowrap;
  color: ${({ $status }) => ($status === 'error' || $status === 'conflict' ? 'var(--danger)' : 'var(--text-3)')};
  ${({ $status }) => $status === 'saving' && dot('var(--accent-fg)', true)}
  ${({ $status }) => $status === 'saved' && dot('var(--ok)')}
  ${({ $status }) => ($status === 'error' || $status === 'conflict') && dot('var(--danger)')}
`;

export const RetryButton = styled.button`
  font: inherit;
  font-size: 12px;
  color: var(--accent-fg);
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
`;
