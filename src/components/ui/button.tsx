import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

const variantStyles = {
  default: 'bg-orange-500 hover:bg-orange-600 text-white',
  outline: 'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-300'
};

const sizeStyles = {
  default: 'px-6 py-3 text-base',
  sm: 'px-4 py-2 text-sm',
  lg: 'px-8 py-4 text-lg'
};

// ============================================================================
// COMPONENT
// ============================================================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-md font-semibold transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
