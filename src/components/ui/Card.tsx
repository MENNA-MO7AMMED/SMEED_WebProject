import React, { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  withHover?: boolean;
  withGlow?: boolean;
  withRainbowGlow?: boolean;
  children: ReactNode;
  footerContent?: ReactNode;
  headerAction?: ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  withHover = false,
  withGlow = false,
  withRainbowGlow = false,
  children,
  footerContent,
  headerAction,
  className = '',
  ...props
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden';
  const hoverClasses = withHover ? 'card-hover' : '';
  const glowClasses = withGlow ? 'glow-hover' : '';
  const rainbowGlowClasses = withRainbowGlow ? 'rainbow-glow-hover' : '';
  
  return (
    <div
      className={`
        ${baseClasses}
        ${hoverClasses}
        ${glowClasses}
        ${rainbowGlowClasses}
        ${className}
      `}
      {...props}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footerContent && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          {footerContent}
        </div>
      )}
    </div>
  );
};

export default Card;