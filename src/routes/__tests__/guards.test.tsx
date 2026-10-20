import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrivateRoutes } from '@/routes/PrivateRoutes';
import { PublicRoutes } from '@/routes/PublicRoutes';

const auth = { isAuthenticated: false, restoring: false, user: null, logout: vi.fn() };
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { element: <PublicRoutes />, children: [{ path: '/login', element: <div>tela de login</div> }] },
      {
        element: <PrivateRoutes />,
        children: [
          { path: '/projects', element: <div>área privada</div> },
          { path: '/dashboard', element: <div>início</div> },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe('proteção de rotas', () => {
  beforeEach(() => Object.assign(auth, { isAuthenticated: false, restoring: false }));

  it('visitante é enviado ao login lembrando o destino', () => {
    const router = renderAt('/projects');
    expect(screen.getByText('tela de login')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.state).toEqual({ from: '/projects' });
  });

  it('usuário autenticado acessa a área privada', () => {
    auth.isAuthenticated = true;
    renderAt('/projects');
    expect(screen.getByText('área privada')).toBeInTheDocument();
  });

  it('usuário autenticado é redirecionado para fora do login', () => {
    auth.isAuthenticated = true;
    const router = renderAt('/login');
    expect(router.state.location.pathname).toBe('/dashboard');
    expect(screen.getByText('início')).toBeInTheDocument();
  });

  it('enquanto restaura a sessão não decide nem redireciona', () => {
    auth.restoring = true;
    renderAt('/projects');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('tela de login')).not.toBeInTheDocument();
  });
});
