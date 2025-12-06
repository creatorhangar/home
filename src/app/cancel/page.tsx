'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#231641] to-[#1a0f2e] px-4">
            <div className="max-w-md w-full text-center">
                {/* Cancel Icon */}
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <XCircle className="w-16 h-16 text-orange-400" />
                    </div>
                </div>

                {/* Cancel Message */}
                <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Instrument Serif, serif' }}>
                    Pagamento Cancelado
                </h1>

                <p className="text-gray-300 text-lg mb-8">
                    Não se preocupe, você pode fazer upgrade a qualquer momento!
                </p>

                {/* Info Box */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
                    <p className="text-gray-300 mb-4">
                        Seu plano <span className="text-blue-400 font-bold">Free</span> continua ativo.
                    </p>
                    <p className="text-gray-400 text-sm">
                        Você ainda pode usar todas as ferramentas com limites gratuitos.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <Link
                        href="/dashboard"
                        className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                    >
                        Voltar para Dashboard
                    </Link>

                    <Link
                        href="/"
                        className="block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-8 rounded-lg transition-colors border border-white/20"
                    >
                        Ir para Home
                    </Link>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-gray-400 text-sm">
                    Precisa de ajuda? Entre em contato com nosso suporte.
                </p>
            </div>
        </div>
    );
}
