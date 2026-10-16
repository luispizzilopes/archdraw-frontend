import { Camera, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Field } from '@/components/ui/Field';
import { FormError } from '@/components/ui/FormError/FormError';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useChangePassword } from '@/hooks/useChangePassword';
import { useDeleteProfilePhoto } from '@/hooks/useDeleteProfilePhoto';
import { useProfile } from '@/hooks/useProfile';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useUploadProfilePhoto } from '@/hooks/useUploadProfilePhoto';
import { validatePassword } from '@/utils/validation';
import { Avatar, Section } from './Profile.styles';

export function Profile() {
  const toast = useToast();
  const { user, logout } = useAuth();
  const { profile, error: loadError } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const upload = useUploadProfilePhoto();
  const removePhoto = useDeleteProfilePhoto();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await updateProfile.execute(name.trim());
      toast('Perfil atualizado.', 'success');
    } catch {}
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    const invalid = current ? validatePassword(next) : 'Informe a senha atual.';
    setPwdError(invalid);
    if (invalid) return;
    try {
      await changePassword.execute({ currentPassword: current, newPassword: next });
      setCurrent('');
      setNext('');
      toast('Senha alterada. Outras sessões foram encerradas.', 'success');
    } catch {}
  };

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    try {
      await upload.execute(file);
      toast('Foto atualizada.', 'success');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const initials = (user?.name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className="page narrow">
      <header className="page-head">
        <div>
          <h1>Meu perfil</h1>
          <p className="muted">{user?.email}</p>
        </div>
      </header>
      {loadError && <FormError message={loadError} />}

      <Section className="panel">
        <h3>Foto</h3>
        <div className="row">
          <Avatar>{user?.avatarUrl ? <img src={user.avatarUrl} alt="Foto de perfil" /> : initials}</Avatar>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => void pickPhoto(e.target.files?.[0])}
          />
          <button className="btn" disabled={upload.loading} onClick={() => fileRef.current?.click()}>
            <Camera size={15} />
            {upload.loading ? 'Enviando…' : 'Trocar foto'}
          </button>
          {user?.avatarUrl && (
            <button
              className="btn btn-ghost"
              onClick={async () => {
                try {
                  await removePhoto.execute();
                  toast('Foto removida.');
                } catch (e) {
                  toast((e as Error).message, 'error');
                }
              }}
            >
              <Trash2 size={15} />
              Remover
            </button>
          )}
        </div>
        <p className="muted small">JPEG, PNG ou WebP, até 2 MB.</p>
      </Section>

      <Section className="panel">
        <h3>Dados pessoais</h3>
        <form className="form" onSubmit={saveName}>
          <Field label="Nome">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </Field>
          <FormError message={updateProfile.error} />
          <div>
            <button className="btn btn-primary" type="submit" disabled={updateProfile.loading || !name.trim()}>
              Salvar
            </button>
          </div>
        </form>
      </Section>

      <Section className="panel">
        <h3>Alterar senha</h3>
        <form className="form" onSubmit={savePassword} noValidate>
          <Field label="Senha atual">
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </Field>
          <Field label="Nova senha" hint="Mínimo de 8 caracteres, com maiúscula, minúscula e número.">
            <input className="input" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
          <FormError message={pwdError ?? changePassword.error} />
          <div>
            <button className="btn btn-primary" type="submit" disabled={changePassword.loading}>
              Alterar senha
            </button>
          </div>
        </form>
      </Section>

      <Section className="panel">
        <h3>Sessão</h3>
        <button className="btn" onClick={() => void logout()}>
          Sair da conta
        </button>
      </Section>
    </div>
  );
}
