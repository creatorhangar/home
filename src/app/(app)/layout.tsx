'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Image as ImageIcon,
    Settings,
    LogOut,
    Menu,
    X,
    CreditCard,
    Grid3x3,
    ChevronRight,
    LogIn,
    UserCircle,
    Plus
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { signOut, user, loading } = useAuth();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const navigation = [
        { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Ferramentas', href: '/tools', icon: Grid3x3, exact: true },
    ];

    const tools = [
        { name: 'Criar Capa', href: '/tools/criador-capas', icon: ImageIcon },
        { name: 'Loop Video', href: '/tools/loop-video', icon: ZapIcon },
        { name: 'Removedor Fundo', href: '/tools/removedor-fundo', icon: ScissorsIcon },
    ];

    const settings = [
        { name: 'Assinatura', href: '/settings/billing', icon: CreditCard },
        { name: 'Configurações', href: '/settings', icon: Settings },
    ];

    function isLinkActive(href: string, exact = false) {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(`${href}/`);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100/50">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-display font-bold text-lg group-hover:scale-105 transition-transform">
                                CH
                            </div>
                            <span className="text-lg font-display font-bold text-gray-900 group-hover:text-primary transition-colors">
                                Creator Hangar
                            </span>
                        </Link>
                        <button
                            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 p-1"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">

                        {/* Main Section */}
                        <div className="space-y-1">
                            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Menu
                            </p>
                            {navigation.map((item) => {
                                const active = isLinkActive(item.href, item.exact);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                            ? 'bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                        {item.name}
                                        {active && <ChevronRight className="w-4 h-4 ml-auto text-primary/40" />}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Quick Tools Section */}
                        <div className="space-y-1">
                            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                                Ferramentas
                                <Link href="/tools" className="hover:text-primary transition-colors" title="Ver todas">
                                    <Plus className="w-3 h-3" />
                                </Link>
                            </p>
                            {tools.map((item) => {
                                const active = isLinkActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                            ? 'bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Settings Section */}
                        <div className="space-y-1">
                            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Conta
                            </p>
                            {settings.map((item) => {
                                const active = isLinkActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                            ? 'bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-gray-400'}`} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Footer / User Profile */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        {!loading && user ? (
                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user.user_metadata?.full_name?.split(' ')[0] || 'Criador'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    title="Sair"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : !loading && (
                            <div className="space-y-2">
                                <Link
                                    href="/login"
                                    className="flex items-center justify-center w-full px-4 py-2.5 text-white bg-primary hover:bg-primary-light rounded-xl font-medium transition-all duration-200 shadow-lg shadow-primary/20 gap-2"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Fazer Login
                                </Link>
                                <p className="text-xs text-center text-gray-500">
                                    Faça login para salvar seus projetos
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-50/50 relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center px-4 justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-600 p-2 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-display font-bold text-gray-900 text-lg">Creator Hangar</span>
                    {user ? (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                    ) : (
                        <div className="w-8" />
                    )}
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Icons helpers
function ZapIcon(props: any) { return <Grid3x3 {...props} /> } // Placeholder, import real ones if needed or reuse Grid
function ScissorsIcon(props: any) { return <Grid3x3 {...props} /> } // Placeholder

