import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md cursor-pointer transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.985]';

  const variantStyles = {
    primary:
      'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_1px_2px_0_rgba(37,99,235,0.25),inset_0_1px_0_0_rgba(255,255,255,0.2)] focus-visible:ring-[#2563EB]',
    secondary:
      'bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] focus-visible:ring-[#2563EB]',
    outline:
      'bg-transparent text-[#475569] border border-[#E2E8F0] hover:text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:ring-[#2563EB]',
    ghost:
      'bg-transparent text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] focus-visible:ring-[#2563EB]',
    destructive:
      'bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3] hover:bg-[#FECDD3] focus-visible:ring-[#E11D48]',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        (disabled || isLoading) && 'opacity-60 pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
