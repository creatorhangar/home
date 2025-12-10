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
            <div className="min-h-full flex flex-col">
                {/* Conteúdo da Ferramenta */}
                <main className="flex-1 relative flex flex-col min-h-0 bg-transparent">
                    {children}
                </main>
            </div>
        </LanguageProvider>
    );
}
