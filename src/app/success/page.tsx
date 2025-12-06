'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#231641] to-[#1a0f2e] px-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-16 h-16 text-green-400" />
                    </div>
                </div>

                {/* Success Message */}
                <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Instrument Serif, serif' }}>
                    Pagamento Confirmado!
                </h1>

                <p className="text-gray-300 text-lg mb-8">
                    Bem-vindo ao plano <span className="text-purple-400 font-bold">Pro</span>! 🎉
                </p>

                {/* Benefits */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                    <h2 className="text-white font-bold mb-4">Agora você tem acesso a:</h2>
                    <ul className="space-y-3 text-left">
                        <li className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>Processamento ilimitado em todas as ferramentas</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>Exportação em alta qualidade</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>Suporte prioritário</span>
                        </li>
                        <li className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span>Novas ferramentas em primeira mão</span>
                        </li>
                    </ul>
                </div>

                {/* Redirect Info */}
                <p className="text-gray-400 text-sm mb-4">
                    Redirecionando para o dashboard em {countdown} segundos...
                </p>

                {/* Manual Link */}
                <Link
                    href="/dashboard"
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                >
                    Ir para Dashboard Agora
                </Link>

                {/* Session ID (for debugging) */}
                {sessionId && (
                    <p className="mt-8 text-gray-500 text-xs">
                        Session ID: {sessionId}
                    </p>
                )}
            </div>
        </div>
    );
}
