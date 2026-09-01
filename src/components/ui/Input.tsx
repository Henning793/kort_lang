import type { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full min-h-9 px-3.5 py-1.5 text-sm text-ink bg-surface border border-divider rounded-pill focus-visible:outline-2 focus-visible:outline-accent ${className}`}
      {...rest}
    />
  );
}
