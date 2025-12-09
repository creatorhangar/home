"use client";

import Link from 'next/link';
import { ArrowLeft, Home, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { LanguageProvider } from '@/components/tools/removedor-fundo/utils/localization';

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Pegar o nome da ferramenta da URL
    const toolName = pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Ferramenta';
    const formattedToolName = toolName.charAt(0).toUpperCase() + toolName.slice(1);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <LanguageProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Navbar das Ferramentas */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50 flex-none h-16">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Lado Esquerdo: Logo + Voltar */}
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/"
                                    className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    Creator Hangar
                                </Link>

                                <span className="text-gray-300">|</span>

                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Voltar ao Dashboard</span>
                                </Link>
                            </div>

                            {/* Centro: Nome da Ferramenta */}
                            <h1 className="hidden md:block text-lg font-semibold text-gray-900">
                                {formattedToolName}
                            </h1>

                            {/* Lado Direito: Ações do Usuário */}
                            <div className="flex items-center gap-3">
                                {user && (
                                    <>
                                        <span className="hidden sm:block text-sm text-gray-600">
                                            {user.email?.split('@')[0]}
                                        </span>

                                        <Link
                                            href="/dashboard"
                                            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                                            title="Dashboard"
                                        >
                                            <Home className="w-5 h-5" />
                                        </Link>

                                        <button
                                            onClick={handleSignOut}
                                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
                                            title="Sair"
                                        >
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {!user && (
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Entrar
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Conteúdo da Ferramenta */}
                <main className="flex-1 relative flex flex-col min-h-0 bg-transparent">
                    {children}
                </main>
            </div>
        </LanguageProvider>
    );
}
