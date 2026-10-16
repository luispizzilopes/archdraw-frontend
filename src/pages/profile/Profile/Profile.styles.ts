import styled from 'styled-components';

export const Section = styled.section``;

export const Avatar = styled.span`
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  overflow: hidden;
  font-size: 24px;
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
