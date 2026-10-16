import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from '@/pages/auth/Login/Login';
import { authService } from '@/services/auth/authService';

vi.mock('@/services/auth/authService', () => ({ authService: { login: vi.fn() } }));
const login = vi.mocked(authService.login);

function renderLogin(from = '/projects') {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state: { from } }]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/projects" element={<div>destino</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('valida os campos antes de chamar a API', async () => {
    renderLogin();
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'invalido');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('e-mail válido');
    expect(login).not.toHaveBeenCalled();
  });

  it('autentica e volta ao destino original', async () => {
    login.mockResolvedValue({} as never);
    renderLogin();
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'ana@teste.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'Senha1234');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(login).toHaveBeenCalledWith({ email: 'ana@teste.com', password: 'Senha1234' });
    expect(await screen.findByText('destino')).toBeInTheDocument();
  });

  it('mostra a mensagem da API para credenciais inválidas e permanece na tela', async () => {
    login.mockRejectedValue(
      new AxiosError('x', 'ERR', undefined, undefined, {
        status: 401,
        statusText: '',
        headers: {},
        config: {} as never,
        data: { code: 'Auth.InvalidCredentials', description: 'E-mail ou senha inválidos.', type: 'Unauthorized' },
      }),
    );
    renderLogin();
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'ana@teste.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.'));
    expect(screen.queryByText('destino')).not.toBeInTheDocument();
  });
});
