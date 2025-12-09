import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide transition duration-200 rounded-lg shadow-md focus:shadow-outline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: 'text-white bg-primary-action hover:bg-opacity-90',
    secondary: 'text-dark-text dark:text-white bg-light-accent dark:bg-border-gray hover:bg-light-border dark:hover:bg-dark-bg',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};