import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';
import { Field } from '@/components/ui/Field';
import { FormError } from '@/components/ui/FormError/FormError';
import { useRegister } from '@/hooks/useRegister';
import { validateEmail, validatePassword } from '@/utils/validation';

export function Register() {
  const nav = useNavigate();
  const { execute, loading, error } = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const invalid =
      (name.trim() ? null : 'Informe seu nome.') ??
      validateEmail(email) ??
      validatePassword(password) ??
      (password === confirm ? null : 'As senhas não coincidem.');
    setFieldError(invalid);
    if (invalid) return;
    try {
      await execute({ name: name.trim(), email: email.trim(), password });
      nav('/', { replace: true });
    } catch {}
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Seus projetos ficam salvos na nuvem e só você acessa."
      footer={
        <span>
          Já tem conta? <Link to="/login">Entrar</Link>
        </span>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        <Field label="Nome">
          <input className="input" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="E-mail">
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Senha" hint="Mínimo de 8 caracteres, com maiúscula, minúscula e número.">
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label="Confirmar senha">
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <FormError message={fieldError ?? error} />
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Criando…' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  );
}
