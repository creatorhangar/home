'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const CriaCapaTool = dynamic(
    () => import('@/components/tools/criador-capas/CriaCapaTool'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[600px] bg-white rounded-xl">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-gray-500">Carregando ferramenta...</p>
                </div>
            </div>
        )
    }
);

export default function CriaCapaPage() {
    return <CriaCapaTool />;
}
