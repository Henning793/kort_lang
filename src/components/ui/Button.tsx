import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
};

const base =
  'inline-flex items-center justify-center gap-1.5 font-heading text-sm leading-tight disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-bg px-5 py-2 hover:bg-accent-600 active:bg-accent-700 rounded-pill',
  secondary: 'border border-divider px-5 py-2 hover:bg-black/5 active:bg-black/10 rounded-pill',
  ghost: 'text-accent px-1 hover:bg-accent-100 active:bg-accent-200 rounded-md',
  icon: 'border border-divider w-9 h-9 p-0 rounded-pill',
};

export function Button({ variant = 'primary', block, className = '', children, ...rest }: Props) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${block ? 'w-full mt-2' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
