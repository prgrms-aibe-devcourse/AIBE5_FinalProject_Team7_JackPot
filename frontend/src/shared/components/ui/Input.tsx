import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...rest }: InputProps) {
  return (
    <label className={className} style={{ display: 'block' }}>
      {label ? <span className="wf-text-label">{label}</span> : null}
      <div className="wf-input" style={{ marginTop: label ? 6 : 0 }}>
        <input className="wf-input--field" {...rest} />
      </div>
    </label>
  );
}
