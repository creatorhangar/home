import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, ...props }) => {
    return (
        <div className="relative flex items-center justify-center w-6 h-6">
            <input
                type="checkbox"
                className="appearance-none w-full h-full rounded-md border-2 border-dark-gray/50 dark:border-light-gray/50 bg-light-card/80 dark:bg-dark-card/80 checked:bg-primary-action checked:border-primary-action transition-all cursor-pointer"
                checked={checked}
                {...props}
            />
            {checked && (
                <svg
                    className="absolute w-4 h-4 text-white pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
    );
};