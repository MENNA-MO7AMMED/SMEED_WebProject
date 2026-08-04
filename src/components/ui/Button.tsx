import React, { ButtonHTMLAttributes } from 'react';
import { rippleEffect } from '../../utils/animations';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'rainbow' | 'Button_2';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  withRipple?: boolean;
  withShimmer?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  withRipple = true,
  withShimmer = false,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  // Base classes
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-800',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-600',
    rainbow: 'text-white shadow-lg rainbow-gradient focus:ring-purple-500 hover:shadow-xl',
    Button_2: 'text-white shadow-lg gradient-flow focus:ring-purple-600 dark:focus:ring-purple-500 shimmer-hover', // أضفنا gradient-flow للأنيميشن المستمر
  };
  
  // Loading spinner classes
  const spinnerClasses = 'animate-spin h-5 w-5';
  
  // Handle click with ripple effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withRipple) {
      rippleEffect(e);
    }
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${withShimmer ? 'shimmer-hover' : ''}
        ${isLoading ? 'cursor-not-allowed opacity-80' : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {variant === 'rainbow' ? (
            <div className="rainbow-loading-ring" />
          ) : (
            <svg className={spinnerClasses} viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </div>
      ) : null}
      <span className={`flex items-center ${isLoading ? 'invisible' : ''}`}>
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </span>
      {withShimmer && (
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="shimmer-effect"></span>
        </span>
      )}
    </button>
  );
};

export default Button;