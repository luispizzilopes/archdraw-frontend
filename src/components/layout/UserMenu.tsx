import { LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Menu } from '@/components/ui/Menu';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Trigger, UserText } from './UserMenu.styles';

export function UserMenu() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;
  const initials =
    user.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || '?';

  return (
    <Menu
      align="left"
      up
      items={[
        { label: 'Meu perfil', icon: <UserRound size={14} />, onClick: () => nav('/profile') },
        { separator: true, label: '', onClick: () => {} },
        { label: 'Sair', icon: <LogOut size={14} />, onClick: () => void logout() },
      ]}
      trigger={({ toggle }) => (
        <Trigger onClick={toggle} aria-label="Menu do usuário">
          <Avatar>{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials}</Avatar>
          <UserText>
            <span>{user.name}</span>
            <small>{user.email}</small>
          </UserText>
        </Trigger>
      )}
    />
  );
}
