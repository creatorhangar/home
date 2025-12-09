'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Spinner from '@/components/Spinner';

const CompressorImagemTool = dynamic(
    () => import('@/components/tools/compressor-imagem/CompressorImagemTool'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner className="w-8 h-8" />
                <span className="ml-2">Carregando Compressor...</span>
            </div>
        )
    }
);

export default function CompressorPage() {
    return <CompressorImagemTool />;
}
