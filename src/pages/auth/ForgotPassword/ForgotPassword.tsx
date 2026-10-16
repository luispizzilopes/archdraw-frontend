import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Field } from '@/components/ui/Field';
import { FormError } from '@/components/ui/FormError/FormError';
import { useToast } from '@/components/ui/Toast';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { useResetPassword } from '@/hooks/useResetPassword';
import { validateEmail, validatePassword } from '@/utils/validation';

export function ForgotPassword() {
  const nav = useNavigate();
  const toast = useToast();
  const request = useForgotPassword();
  const reset = useResetPassword();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const sendCode = async (e: FormEvent) => {
    e.preventDefault();
    const invalid = validateEmail(email);
    setFieldError(invalid);
    if (invalid) return;
    try {
      await request.execute(email.trim());
      setStep('confirm');
    } catch {}
  };

  const confirm = async (e: FormEvent) => {
    e.preventDefault();
    const invalid = (/^\d{6}$/.test(code) ? null : 'O código tem 6 dígitos.') ?? validatePassword(password);
    setFieldError(invalid);
    if (invalid) return;
    try {
      await reset.execute({ email: email.trim(), code, newPassword: password });
      toast('Senha redefinida. Entre com a nova senha.', 'success');
      nav('/login', { replace: true });
    } catch {}
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle={
        step === 'request'
          ? 'Enviaremos um código de 6 dígitos para o seu e-mail.'
          : `Digite o código enviado para ${email} e escolha uma nova senha.`
      }
      footer={<Link to="/login">Voltar ao login</Link>}
    >
      {step === 'request' ? (
        <form className="form" onSubmit={sendCode} noValidate>
          <Field label="E-mail">
            <input className="input" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <FormError message={fieldError ?? request.error} />
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={request.loading}>
            {request.loading ? 'Enviando…' : 'Enviar código'}
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={confirm} noValidate>
          <Field label="Código">
            <input
              className="input mono code-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label="Nova senha" hint="Mínimo de 8 caracteres, com maiúscula, minúscula e número.">
            <PasswordInput
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <FormError message={fieldError ?? reset.error} />
          <div className="auth-actions">
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={reset.loading}>
              {reset.loading ? 'Salvando…' : 'Redefinir senha'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                setStep('request');
                setCode('');
                setFieldError(null);
              }}
            >
              Usar outro e-mail
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
