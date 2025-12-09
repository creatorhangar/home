import React from 'react';

export default function Spinner({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${className}`}></div>
    );
}
