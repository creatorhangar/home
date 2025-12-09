'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Importação dinâmica para desativar SSR
// Isso é crucial para apps que usam window/canvas pesadamente
const RemovedorFundoTool = dynamic(
    () => import('@/components/tools/removedor-fundo/RemovedorFundoTool'),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-gray-500">Carregando Removedor de Fundo...</p>
            </div>
        )
    }
);

export default function RemovedorFundoPage() {
    return <RemovedorFundoTool />;
}
