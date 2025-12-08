'use client';

import { useState } from 'react';
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
    Grid3x3
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { signOut, user } = useAuth();

    const navigation = [
        { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Criar Capa', href: '/tools/criador-capas', icon: ImageIcon }, // New tool
        { name: 'Ferramentas', href: '/tools', icon: Grid3x3 },
        { name: 'Assinatura', href: '/settings/billing', icon: CreditCard },
        { name: 'Configurações', href: '/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <Link href="/" className="text-xl font-display font-bold text-primary">
                            Creator Hangar
                        </Link>
                        <button
                            className="ml-auto lg:hidden text-gray-500"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.user_metadata?.full_name || 'Usuário'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="text-gray-400 hover:text-gray-600"
                                title="Sair"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 p-2 -ml-2 rounded-lg hover:bg-gray-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-semibold text-gray-900">Creator Hangar</span>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
