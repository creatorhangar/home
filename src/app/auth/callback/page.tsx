'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            // Get the session from the URL
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during auth callback:', error);
                router.push('/login?error=auth_failed');
                return;
            }

            if (session) {
                // Redirect to dashboard on successful auth
                router.push('/dashboard');
            } else {
                // No session, redirect to login
                router.push('/login');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#231641] to-[#1a0f2e]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">Autenticando...</p>
            </div>
        </div>
    );
}
