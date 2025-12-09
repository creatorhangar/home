'use client';

import React from 'react';
import { Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

interface FreeLimitModalProps {
    isOpen: boolean;
    toolName: string;
    limit: number;
}

export function FreeLimitModal({ isOpen, toolName, limit }: FreeLimitModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center transform transition-all scale-100">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Limite Diário Atingido
                </h2>

                <p className="text-gray-600 mb-6">
                    Você atingiu o limite de {limit} usos gratuitos hoje para a ferramenta <span className="font-semibold">{toolName}</span>.
                    Para continuar usando sem limites, faça login ou crie uma conta gratuita!
                </p>

                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="flex items-center justify-center w-full px-4 py-3 text-white bg-primary hover:bg-primary-dark rounded-xl font-medium transition-colors gap-2"
                    >
                        <LogIn className="w-5 h-5" />
                        Fazer Login
                    </Link>

                    <Link
                        href="/signup"
                        className="block w-full px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                        Criar Conta Gratuita
                    </Link>
                </div>

                <p className="mt-4 text-xs text-gray-400">
                    O contador reseta à meia-noite.
                </p>
            </div>
        </div>
    );
}
