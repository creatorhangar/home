"use client";

import { useAuth } from '@/lib/hooks/useAuth';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Loader2, Crown, Zap, LogOut, Settings, Grid3x3, ArrowRight, Star, Clock } from 'lucide-react';
import UpgradeButton from '@/components/pricing/UpgradeButton';

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { subscription, loading: subLoading, isPro, isFree } = useSubscription(user?.id);
    const router = useRouter();
    const [isAnnual, setIsAnnual] = useState(false);

    const loading = authLoading || subLoading;

    // Use "guest" mode instead of redirecting
    const isGuest = !authLoading && !user;

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                        {isGuest ? 'Bem-vindo, Criador! 🚀' : `Olá, ${user?.user_metadata?.full_name?.split(' ')[0] || 'Criador'}! 👋`}
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        {isGuest
                            ? 'Explore nossas ferramentas gratuitas e comece a criar.'
                            : 'Aqui está o resumo do seu estúdio criativo.'}
                    </p>
                </div>
                {!isGuest && isFree && (
                    <Link href="/settings/billing" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
                        <Crown className="w-4 h-4" />
                        Upgrade para Pro
                    </Link>
                )}
                {isGuest && (
                    <Link href="/signup" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
                        Criar Conta Grátis
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>

            {/* Quick Actions / Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Plan Status */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-primary rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Seu Plano</p>
                        <h3 className="text-3xl font-bold text-primary mb-2">
                            {isGuest ? 'Visitante' : (isPro ? 'Pro' : 'Gratuito')}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {isGuest
                                ? 'Acesso limitado às ferramentas'
                                : (isPro ? 'Acesso total ilimitado' : 'Acesso básico diário')}
                        </p>
                    </div>
                </div>

                {/* Usage Stats (Mocked for Guest, Real for User) */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm group hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Uso Diário</h3>
                    </div>
                    {isPro ? (
                        <div>
                            <p className="text-2xl font-bold text-gray-900">Ilimitado</p>
                            <p className="text-sm text-gray-500">Você é Pro! Crie sem limites.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold text-gray-900">{isGuest ? 'Limites' : '0/5'}</span>
                                <span className="text-sm text-gray-500 mb-1">usos hoje</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-primary h-full rounded-full w-[20%]" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Tools Count */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm group hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Grid3x3 className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Ferramentas</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">4+</p>
                    <p className="text-sm text-gray-500">Disponíveis para uso imediato</p>
                </div>
            </div>

            {/* Featured Tools Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        Destaques
                    </h2>
                    <Link href="/tools" className="text-sm font-medium text-primary hover:text-primary-light transition-colors">
                        Ver todas &rarr;
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Tool Card 1 */}
                    <Link href="/tools/removedor-fundo" className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            🖼️
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Removedor de Fundo</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">Remova fundos de imagens instantaneamente com precisão de IA.</p>
                        <div className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                            Mais Popular
                        </div>
                    </Link>

                    {/* Tool Card 2 */}
                    <Link href="/tools/loop-video" className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                            🌀
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Loop Video</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">Crie vídeos em loop hipnóticos e fractais para redes sociais.</p>
                        <div className="flex items-center text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit">
                            Novo
                        </div>
                    </Link>

                    {/* Tool Card 3 */}
                    <Link href="/tools/criador-capas" className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xl mb-4 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            🎨
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Criador de Capas</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">Crie capas para Etsy atraentes em segundos.</p>
                    </Link>
                </div>
            </div>

            {/* Promo Banner for Free Users */}
            {(isFree || isGuest) && (
                <div className="relative overflow-hidden rounded-3xl bg-primary text-white p-8 md:p-12">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                            Leve suas criações para o próximo nível
                        </h2>
                        <p className="text-white/80 mb-8 text-lg">
                            Desbloqueie ferramentas ilimitadas, exportações em 4K e suporte prioritário com o plano Pro.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/settings/billing" className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-colors">
                                Ver Planos
                            </Link>
                            {!isGuest && (
                                <button onClick={() => router.push('/tools')} className="px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors border border-white/30">
                                    Continuar no Grátis
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>
                </div>
            )}
        </div>
    );
}
