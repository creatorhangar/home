import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Layout } from 'lucide-react';
import type { ProductInfo, GeneratorOptions } from '../types';

interface TextInputFormProps {
    productInfo: ProductInfo;
    onProductInfoChange: (info: ProductInfo) => void;
    onNext: () => void;
    generatorOptions: GeneratorOptions;
    onOptionsChange: (options: GeneratorOptions) => void;
    isValid: boolean;
}

export function TextInputForm({
    productInfo,
    onProductInfoChange,
    onNext,
    generatorOptions,
    onOptionsChange,
    isValid
}: TextInputFormProps) {
    const [name, setName] = useState(productInfo.name || '');
    const [subtitle, setSubtitle] = useState(productInfo.subtitle || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    const toggleMode = (mode: 'quick' | 'advanced') => {
        onOptionsChange({
            ...generatorOptions,
            mode
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Formulário */}
            <form id="info-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Nome do Produto */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                        Nome do Produto *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            onProductInfoChange({ ...productInfo, name: e.target.value });
                        }}
                        placeholder="Ex: Boho Christmas Patterns"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        required
                    />
                </div>

                {/* Subtítulo */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                        Subtítulo (opcional)
                    </label>
                    <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => {
                            setSubtitle(e.target.value);
                            onProductInfoChange({ ...productInfo, subtitle: e.target.value });
                        }}
                        placeholder="Ex: 12x12 inches | 300 DPI"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
            </form>

            <div className="h-px bg-white/10 my-4" />

            {/* Opções de Geração */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/80 mb-2">Modo de Geração</h4>

                {/* Modo Rápido */}
                <button
                    type="button"
                    onClick={() => toggleMode('quick')}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${generatorOptions.mode === 'quick'
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${generatorOptions.mode === 'quick' ? 'text-primary' : 'text-white/60'}`} />
                        <span className="font-semibold text-sm">Automático</span>
                    </div>
                </button>

                {/* Modo Avançado */}
                <button
                    type="button"
                    onClick={() => toggleMode('advanced')}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${generatorOptions.mode === 'advanced'
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Layout className={`w-4 h-4 ${generatorOptions.mode === 'advanced' ? 'text-primary' : 'text-white/60'}`} />
                        <span className="font-semibold text-sm">Personalizado</span>
                    </div>
                </button>
            </div>

            {/* Action Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    form="info-form"
                    disabled={!isValid}
                    className="w-full btn-primary py-4 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isValid ? '✨ Gerar Vitrine' : 'Preencha os dados'}
                </button>
                <p className="text-center text-xs text-white/40 mt-3">
                    Gera capas e mockups automaticamente
                </p>
            </div>
        </motion.div>
    );
}
