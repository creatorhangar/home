'use client';

import Link from 'next/link';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ToolsPage() {
    const { user } = useAuth();
    const { isPro } = useSubscription(user?.id);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
                    Ferramentas
                </h1>
                <p className="text-gray-600">
                    Acesse todas as nossas ferramentas de criação
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tool Card - Criador de Capas */}
                <Link
                    href="/tools/criador-capas"
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 group"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                        <span className="text-2xl">🎨</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">
                        Criador de Capas
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Crie capas profissionais para seus produtos
                    </p>
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                        {isPro ? 'Ilimitado' : '5 Grátis/dia'}
                    </span>
                </Link>

                {/* Tool Card - Removedor de Fundo (Placeholder until integrated) */}
                <Link
                    href="/tools/removedor-fundo"
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 group opacity-75 grayscale hover:grayscale-0"
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
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">
                        Em manutenção
                    </span>
                </Link>

                {/* More tools coming soon */}
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-2xl">➕</span>
                    </div>
                    <h3 className="font-bold text-gray-600 mb-2">
                        Mais ferramentas
                    </h3>
                    <p className="text-sm text-gray-500">
                        Novidades em breve!
                    </p>
                </div>
            </div>
        </div>
    );
}
