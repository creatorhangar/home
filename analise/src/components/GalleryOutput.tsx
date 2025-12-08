import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Grid, Image as ImageIcon, Share2, Edit2 } from 'lucide-react';
import type { GeneratedOutput } from '../types';
import { CoverEditor } from './CoverEditor';

interface GalleryOutputProps {
    outputs: GeneratedOutput[];
    onDownload: (output: GeneratedOutput) => void;
    onDownloadAll: () => void;
}

export function GalleryOutput({ outputs, onDownload, onDownloadAll }: GalleryOutputProps) {
    const [editingOutput, setEditingOutput] = useState<GeneratedOutput | null>(null);

    const groupedOutputs = React.useMemo(() => {
        const groups: Record<string, GeneratedOutput[]> = {
            showcase: [],
            mockup: [],
            hero: [],
            social: [],
        };

        outputs.forEach(output => {
            if (groups[output.type]) {
                groups[output.type].push(output);
            } else {
                // Fallback para tipos desconhecidos
                if (!groups['other']) groups['other'] = [];
                groups['other'].push(output);
            }
        });

        return groups;
    }, [outputs]);

    const TypeIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'showcase': return <Grid className="w-5 h-5" />;
            case 'mockup': return <ImageIcon className="w-5 h-5" />;
            case 'hero': return <Share2 className="w-5 h-5" />;
            default: return <ImageIcon className="w-5 h-5" />;
        }
    };

    const TypeLabel: Record<string, string> = {
        showcase: 'Capas Showcase',
        mockup: 'Mockups',
        hero: 'Hero Images',
        social: 'Social Media',
        other: 'Outros',
    };

    return (
        <div className="space-y-12">
            {/* Editor Modal */}
            {editingOutput && (
                <CoverEditor
                    isOpen={!!editingOutput}
                    onClose={() => setEditingOutput(null)}
                    output={editingOutput}
                    onSave={(newOutput) => {
                        // TODO: Atualizar lista de outputs com o novo
                        console.log('Saved', newOutput);
                        setEditingOutput(null);
                    }}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold font-luxury mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        🎉 Suas capas estão prontas!
                    </h2>
                    <p className="text-white/60 text-lg font-light tracking-wide">
                        {outputs.length} imagens geradas com sucesso
                    </p>
                </div>

                <button
                    onClick={onDownloadAll}
                    className="btn-primary flex items-center gap-3 px-8 py-4 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 font-display tracking-wide"
                >
                    <Download className="w-6 h-6" />
                    Baixar Tudo (.zip)
                </button>
            </div>

            {/* Grouped Outputs */}
            {Object.entries(groupedOutputs).map(([type, items]) => {
                if (!items || items.length === 0) return null;

                return (
                    <div key={type} className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <div className="p-2.5 rounded-xl bg-white/5 text-primary">
                                <TypeIcon type={type} />
                            </div>
                            <h3 className="text-2xl font-serif-display italic tracking-wide">
                                {TypeLabel[type] || type}
                                <span className="ml-3 text-sm font-sans font-normal text-white/40 bg-white/5 px-3 py-1 rounded-full not-italic">
                                    {items.length}
                                </span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {items.map((output, index) => (
                                <motion.div
                                    key={output.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                                >
                                    {/* Preview Image */}
                                    <div className="aspect-[4/3] overflow-hidden bg-black/20 relative">
                                        <img
                                            src={output.url}
                                            alt={output.name}
                                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                                            <button
                                                onClick={() => setEditingOutput(output)}
                                                className="p-3 rounded-full bg-white text-black hover:scale-110 transition-transform shadow-lg"
                                                title="Personalizar"
                                            >
                                                <Edit2 className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => onDownload(output)}
                                                className="p-3 rounded-full bg-white text-black hover:scale-110 transition-transform shadow-lg"
                                                title="Baixar"
                                            >
                                                <Download className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => window.open(output.url, '_blank')}
                                                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all backdrop-blur-md"
                                                title="Visualizar"
                                            >
                                                <ImageIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5">
                                        <h4 className="font-semibold truncate text-lg mb-1" title={output.name}>
                                            {output.name}
                                        </h4>

                                        <div className="flex items-center justify-between text-sm text-white/40">
                                            <span>{output.width} × {output.height}px</span>
                                            <span className="uppercase bg-white/5 px-2 py-0.5 rounded text-xs font-medium tracking-wider">
                                                {output.format}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
