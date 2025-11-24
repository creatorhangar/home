'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { Lock, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ActionWrapperProps {
    children: ReactNode;
    requiresPro?: boolean;
    toolName: string;
    actionType: 'button' | 'section';
    onAction?: () => void;
    className?: string;
}

export function ActionWrapper({
    children,
    requiresPro = false,
    toolName,
    actionType,
    onAction,
    className = ''
}: ActionWrapperProps) {
    const { user, loading: authLoading } = useAuth();
    const { isPro, loading: subLoading } = useSubscription(user?.id);

    const loading = authLoading || subLoading;

    // Se não requer Pro, apenas renderiza
    if (!requiresPro) {
        return <>{children}</>;
    }

    // Se está carregando
    if (loading) {
        return (
            <div className={`relative ${className}`}>
                {children}
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    // Se não está logado
    if (!user) {
        return (
            <div className={`relative ${className}`}>
                {actionType === 'button' ? (
                    <div className="opacity-50 cursor-not-allowed">
                        {children}
                    </div>
                ) : (
                    <div className="opacity-50 pointer-events-none">
                        {children}
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl border-2 border-primary/20">
                    <div className="text-center p-6 max-w-sm">
                        <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Login Necessário
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            Faça login para usar <span className="font-semibold">{toolName}</span>
                        </p>
                        <Link
                            href="/login"
                            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                            Fazer Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Se está logado mas não é Pro
    if (!isPro) {
        return (
            <div className={`relative ${className}`}>
                {actionType === 'button' ? (
                    <div className="opacity-50 cursor-not-allowed">
                        {children}
                    </div>
                ) : (
                    <div className="opacity-50 pointer-events-none">
                        {children}
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/95 to-purple-600/95 backdrop-blur-sm rounded-xl border-2 border-yellow-400/50">
                    <div className="text-center p-6 text-white max-w-sm">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <h3 className="text-xl font-bold mb-2">
                            Recurso Pro
                        </h3>
                        <p className="mb-4 text-sm text-white/90">
                            Upgrade para Pro e desbloqueie <span className="font-semibold">{toolName}</span>
                        </p>
                        <Link
                            href="/#pricing"
                            className="inline-block bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl"
                        >
                            Ver Planos Pro
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Se é Pro, executa a ação
    if (actionType === 'button' && onAction) {
        return (
            <div onClick={onAction} className={className}>
                {children}
            </div>
        );
    }

    return <div className={className}>{children}</div>;
}
