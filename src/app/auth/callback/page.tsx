'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (errorParam) {
          console.error('OAuth error:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        // Exchange the code for a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (session) {
          console.log('Session established:', session.user.email);
          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          console.log('No session found, redirecting to login');
          router.push('/login');
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Erro desconhecido');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#231641] to-[#1a0f2e]">
      <div className="text-center max-w-md px-4">
        {error ? (
          <>
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-2xl font-bold mb-2">Erro na Autenticação</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-gray-400 text-sm">Redirecionando para login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Autenticando...</p>
            <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
          </>
        )}
      </div>
    </div>
  );
}
