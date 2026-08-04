import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode; // Add leftIcon prop
  iconPosition?: 'left' | 'right';
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  withAnimation?: boolean;
  hideEye?: boolean; // Add hideEye prop to control eye visibility
  borderColor?: string; // Add borderColor prop to control border color dynamically
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      leftIcon, // Added
      iconPosition = 'left',
      helperText,
      containerClassName = '',
      labelClassName = '',
      inputClassName = '',
      errorClassName = '',
      helperClassName = '',
      withAnimation = true,
      type,
      hideEye = false, // Default to false (show eye for password)
      borderColor = 'border-gray-300', // Default border color
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    const baseContainerClasses = 'w-full';
    const baseLabelClasses = 'block text-sm font-medium mb-1 transition-colors';
    const baseInputClasses = `
      w-full rounded-lg border transition-all duration-200 py-2 px-3 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    `;
    const baseErrorClasses = 'text-red-500 text-sm mt-1';
    const baseHelperClasses = 'text-gray-500 text-sm mt-1';

    // Dark mode classes
    const darkModeClasses = `
      dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
      dark:focus:ring-blue-400 dark:placeholder-gray-500
    `;

    // Animation classes
    const animationClasses = withAnimation
      ? `transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`
      : '';

    // Error state classes (removed since we use borderColor prop)
    const errorStateClasses = error ? 'border-red-500 focus:ring-red-400' : '';

    // Icon padding
    const iconPaddingClasses = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : '';
    const leftIconPaddingClasses = leftIcon ? 'pl-10' : ''; // Padding for leftIcon

    // Password toggle padding
    const passwordTogglePadding = isPasswordType && !hideEye ? 'pr-10' : '';

    return (
      <div className={`${baseContainerClasses} ${containerClassName}`}>
        {label && (
          <label
            htmlFor={props.id || props.name}
            className={`
              ${baseLabelClasses}
              ${error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}
              ${labelClassName}
            `}
          >
            {label}
          </label>
        )}

        <div className={`relative ${animationClasses}`}>
          {(icon && iconPosition === 'left') || leftIcon ? (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {leftIcon || icon}
            </div>
          ) : null}

          <input
            ref={ref}
            type={inputType}
            className={`
              ${baseInputClasses}
              ${borderColor} // Use dynamic borderColor
              ${darkModeClasses}
              ${iconPaddingClasses}
              ${leftIconPaddingClasses}
              ${passwordTogglePadding}
              ${inputClassName}
              ${error ? 'animate-shake' : ''}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {icon && iconPosition === 'right' && !isPasswordType && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {icon}
            </div>
          )}

          {isPasswordType && !hideEye && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error && (
          <p className={`${baseErrorClasses} ${errorClassName} animate-slide-in-up`}>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className={`${baseHelperClasses} ${helperClassName}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;