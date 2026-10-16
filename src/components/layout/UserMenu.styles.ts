import styled from 'styled-components';

export const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  margin-top: 4px;
  font: inherit;
  text-align: left;
  color: var(--text);
  background: transparent;
  border: 0;
  border-top: 1px solid var(--border);
  cursor: pointer;

  &:hover {
    background: var(--surface-2);
  }
`;

export const Avatar = styled.span`
  display: grid;
  place-items: center;
  flex: none;
  width: 30px;
  height: 30px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-ink);
  background: var(--accent);
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const UserText = styled.span`
  display: grid;
  min-width: 0;
  line-height: 1.25;

  span,
  small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  span {
    font-size: 13px;
    font-weight: 500;
  }
  small {
    font-size: 11.5px;
    color: var(--text-3);
  }
`;
