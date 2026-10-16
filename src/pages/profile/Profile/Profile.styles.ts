import styled from 'styled-components';

export const Section = styled.section`
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
`;

export const Avatar = styled.span`
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  overflow: hidden;
  font-size: 18px;
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
