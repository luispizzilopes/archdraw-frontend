import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';

export function PasswordInput({ className = '', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  const label = visible ? 'Ocultar senha' : 'Mostrar senha';
  return (
    <span className="password-input">
      <input {...props} className={`input ${className}`.trim()} type={visible ? 'text' : 'password'} />
      <button type="button" className="icon-btn password-toggle" title={label} aria-pressed={visible} onClick={() => setVisible((v) => !v)}>
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </span>
  );
}
