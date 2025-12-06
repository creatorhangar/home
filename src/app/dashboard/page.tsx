"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Crown, Zap, LogOut, Settings, Grid3x3 } from 'lucide-react';
import UpgradeButton from '@/components/pricing/UpgradeButton';

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { subscription, loading: subLoading, isPro, isFree } = useSubscription(user?.id);
    const router = useRouter();

    const loading = authLoading || subLoading;

    // Redirect if not logged in
    if (!authLoading && !user) {
        router.push('/login');
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-display font-bold text-primary">
                        Creative Hangar
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                        Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Bem-vindo ao seu painel de controle
                    </p>
                </div>

                {/* Plan Card */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className={`${isPro ? 'bg-gradient-to-br from-primary to-purple-600 text-white' : 'bg-white border-2 border-gray-200'} rounded-2xl p-6 shadow-lg`}>
                        <div className="flex items-center gap-3 mb-4">
                            {isPro ? (
                                <Crown className="w-8 h-8 text-yellow-300" />
                            ) : (
                                <Zap className="w-8 h-8 text-gray-400" />
                            )}
                            <div>
                                <p className={`text-sm ${isPro ? 'text-white/80' : 'text-gray-600'}`}>
                                    Plano Atual
                                </p>
                                <h3 className={`text-2xl font-bold ${isPro ? 'text-white' : 'text-gray-900'}`}>
                                    {subscription?.plan_type === 'pro' ? 'Pro' : 'Grátis'}
                                </h3>
                            </div>
                        </div>

                        {isFree && (
                            <div className="mt-4">
                                <UpgradeButton period="monthly" />
                            </div>
                        )}

                        {isPro && (
                            <div className="mt-4">
                                <p className="text-white/80 text-sm">
                                    Status: <span className="font-semibold text-white">{subscription?.status}</span>
                                </p>
                                {subscription?.current_period_end && (
                                    <p className="text-white/80 text-sm mt-1">
                                        Renova em: {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Grid3x3 className="w-6 h-6 text-primary" />
                            <h3 className="font-bold text-gray-900">Ferramentas</h3>
                        </div>
                        <p className="text-3xl font-display font-bold text-gray-900">
                            {isPro ? '13' : '3'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {isPro ? 'Todas desbloqueadas' : 'Limitadas no plano grátis'}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="w-6 h-6 text-primary" />
                            <h3 className="font-bold text-gray-900">Uso Hoje</h3>
                        </div>
                        <p className="text-3xl font-display font-bold text-gray-900">
                            0 / {isPro ? '∞' : '5'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {isPro ? 'Edições ilimitadas' : 'Edições restantes'}
                        </p>
                    </div>
                </div>

                {/* Tools Grid */}
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
                        Suas Ferramentas
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Tool Card - Removedor de Fundo */}
                        <Link
                            href="/tools/removedor-fundo"
                            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <span className="text-2xl">🖼️</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">
                                Removedor de Fundo
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Remova fundos de imagens em lote
                            </p>
                            {!isPro && (
                                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                                    Requer Pro
                                </span>
                            )}
                        </Link>

                        {/* More tools coming soon */}
                        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">➕</span>
                            </div>
                            <h3 className="font-bold text-gray-600 mb-2">
                                Mais ferramentas em breve
                            </h3>
                            <p className="text-sm text-gray-500">
                                Estamos trabalhando em novas ferramentas incríveis!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Free Plan CTA */}
                {isFree && (
                    <div className="mt-12 bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 text-white">
                        <div className="max-w-2xl">
                            <h3 className="text-3xl font-display font-bold mb-4">
                                Desbloqueie todo o potencial 🚀
                            </h3>
                            <p className="text-white/90 mb-6">
                                Upgrade para Pro e tenha acesso a todas as 13 ferramentas, edições ilimitadas, suporte prioritário e muito mais!
                            </p>
                            <Link
                                href="/#pricing"
                                className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all"
                            >
                                Ver Planos Pro
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
