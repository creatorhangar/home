'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Spinner from '@/components/Spinner';

const GeradorTemplatesTool = dynamic(
    () => import('@/components/tools/gerador-templates/GeradorTemplatesTool'),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner className="w-8 h-8" />
                <span className="ml-2">Carregando Gerador de Templates...</span>
            </div>
        )
    }
);

export default function TemplatesPage() {
    return <GeradorTemplatesTool />;
}
