import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...rest }: InputProps) {
  return (
    <label className={`wf-input-label${className ? ` ${className}` : ''}`}>
      {label ? <span className="wf-text-label">{label}</span> : null}
      <div className={`wf-input${label ? ' wf-input--labeled' : ''}`}>
        <input className="wf-input--field" {...rest} />
      </div>
    </label>
  );
}
