import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Field } from '@/components/ui/Field';
import { FormError } from '@/components/ui/FormError/FormError';
import { useLogin } from '@/hooks/useLogin';
import { validateEmail } from '@/utils/validation';

export function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const { execute, loading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const invalid = validateEmail(email) ?? (password ? null : 'Informe a senha.');
    setFieldError(invalid);
    if (invalid) return;
    try {
      await execute({ email: email.trim(), password });
      nav(from, { replace: true });
    } catch {}
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse seus projetos e diagramas de arquitetura."
      footer={
        <>
          <Link to="/forgot-password">Esqueci minha senha</Link>
          <span>
            Novo por aqui? <Link to="/register">Criar conta</Link>
          </span>
        </>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        <Field label="E-mail">
          <input className="input" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha">
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <FormError message={fieldError ?? error} />
        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
