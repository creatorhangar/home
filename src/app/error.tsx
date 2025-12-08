'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error caught:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Algo deu errado!</h2>
                <p className="text-gray-600 mb-6 text-sm">
                    Não foi possível carregar a aplicação corretamente.
                </p>

                {/* Show technical details only if needed, or keep hidden/expandable */}
                <div className="bg-gray-100 p-3 rounded text-left mb-6 overflow-auto max-h-32 text-xs font-mono text-gray-700">
                    <p className="font-bold text-red-500">Error: {error.message}</p>
                    {error.digest && <p className="mt-1 text-gray-500">Digest: {error.digest}</p>}
                </div>

                <button
                    onClick={reset}
                    className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                    Tentar novamente
                </button>
            </div>
        </div>
    );
}
