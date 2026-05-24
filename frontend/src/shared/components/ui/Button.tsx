import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'ghost';

interface ButtonAsButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: undefined;
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
}

interface ButtonAsLink {
  to: string;
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'primary', block, children, className = '' } = props;
  const classes = ['wf-btn', variant === 'primary' ? 'wf-btn--primary' : 'wf-btn--ghost', block ? 'wf-btn--block' : '', className]
    .filter(Boolean)
    .join(' ');

  if ('to' in props && props.to) {
    const { to, style } = props;
    return (
      <Link to={to} className={classes} style={style}>
        {children}
      </Link>
    );
  }

  const { style, ...rest } = props as ButtonAsButton;
  return (
    <button type="button" className={classes} style={style} {...rest}>
      {children}
    </button>
  );
}
