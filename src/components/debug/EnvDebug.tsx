'use client';

import { useEffect, useState } from 'react';

export function EnvDebug() {
    const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check for existence of key variables without exposing values
        setEnvStatus({
            NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        });
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-50 hover:opacity-100 z-50"
            >
                Debug Env
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs z-50 font-mono max-w-xs">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-yellow-400">Environment Check</h3>
                <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-1">
                {Object.entries(envStatus).map(([key, exists]) => (
                    <div key={key} className="flex justify-between gap-4">
                        <span className="truncate" title={key}>{key.replace('NEXT_PUBLIC_', '')}</span>
                        <span className={exists ? "text-green-400" : "text-red-500 font-bold"}>
                            {exists ? "OK" : "MISSING"}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700 text-[10px] text-gray-400">
                Build Time: {new Date().toISOString()}
            </div>
        </div>
    );
}
