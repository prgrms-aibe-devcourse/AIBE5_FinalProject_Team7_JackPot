import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

interface ButtonAsButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: undefined;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

interface ButtonAsLink {
  to: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'primary', size = 'md', block, children, className = '' } = props;

  const variantClass = {
    primary: 'wf-btn--primary',
    ghost: 'wf-btn--ghost',
    danger: 'wf-btn--danger',
  }[variant];

  const classes = [
    'wf-btn',
    variantClass,
    size === 'sm' ? 'wf-btn--sm' : '',
    block ? 'wf-btn--block' : '',
    className,
  ]
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

  const { style, block: _b, variant: _v, size: _s, ...rest } = props as ButtonAsButton;
  return (
    <button type="button" className={classes} style={style} {...rest}>
      {children}
    </button>
  );
}
