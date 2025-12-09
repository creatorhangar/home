
import React from 'react';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'normal' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = 'primary',
  size = 'normal',
  disabled,
  className,
  ...props
}) => {
  const baseClasses = "flex items-center justify-center font-sans rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-creme";
  
  const variantClasses = {
    primary: "text-white bg-gradient-to-r from-accent-secondary to-accent-primary hover:shadow-lg hover:brightness-105 focus:ring-accent-primary",
    secondary: "bg-transparent text-text-secondary border border-gray-300 hover:bg-gray-100 hover:text-text-primary focus:ring-accent-primary",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizeClasses = {
    normal: "px-4 py-2 font-semibold text-sm",
    large: "px-6 py-3 font-bold text-lg",
  };

  const disabledClasses = "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:brightness-100";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className || ''}`;

  return (
    <button disabled={disabled || isLoading} className={classes} {...props}>
      {isLoading ? <Spinner className="-ml-1 mr-3 text-white" /> : null}
      {children}
    </button>
  );
};

export default Button;