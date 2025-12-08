import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Type, Palette, Image as ImageIcon } from 'lucide-react';
import type { GeneratedOutput } from '../types';

interface CoverEditorProps {
    isOpen: boolean;
    onClose: () => void;
    output: GeneratedOutput;
    onSave: (newOutput: GeneratedOutput) => void;
}

export function CoverEditor({ isOpen, onClose, output, onSave }: CoverEditorProps) {

    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState<'text' | 'style' | 'background'>('style');
    const [previewUrl, _setPreviewUrl] = useState(output.url);
    const [isGenerating, _setIsGenerating] = useState(false);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1A1A1A] w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex shadow-2xl border border-white/10"
                >
                    {/* Preview Area (Left) */}
                    <div className="flex-1 bg-[#0F0F0F] relative flex items-center justify-center p-8">
                        <div className="relative h-full w-full flex items-center justify-center">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
                            />
                            {isGenerating && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            )}
                        </div>

                        {/* Toolbar Flutuante */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10">
                            <button
                                onClick={() => setActiveTab('style')}
                                className={`p-3 rounded-lg transition-colors ${activeTab === 'style' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                title="Estilo"
                            >
                                <Palette className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`p-3 rounded-lg transition-colors ${activeTab === 'text' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                title="Texto"
                            >
                                <Type className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setActiveTab('background')}
                                className={`p-3 rounded-lg transition-colors ${activeTab === 'background' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                                title="Fundo"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Sidebar de Edição (Right) */}
                    <div className="w-96 bg-[#1A1A1A] border-l border-white/10 flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Personalizar</h3>
                            <button onClick={onClose} className="text-white/60 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {activeTab === 'style' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-3">Cor da Etiqueta</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {['#FFFFFF', '#F5F5DC', '#F9F5E9', '#1A1A1A', '#2C1810', '#759895', '#D4C5B0', '#E0D5C0', '#FFD700', '#C0C0C0'].map(color => (
                                                <button
                                                    key={color}
                                                    className="w-10 h-10 rounded-full border-2 border-white/10 hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => console.log('Set color', color)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-3">Fonte</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none">
                                            <option value="Playfair Display">Playfair Display (Serif)</option>
                                            <option value="Lato">Lato (Sans)</option>
                                            <option value="Outfit">Outfit (Modern)</option>
                                            <option value="Great Vibes">Great Vibes (Script)</option>
                                            <option value="Cinzel">Cinzel (Vintage)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'text' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-2">Título Principal</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                                            placeholder="Nome do Produto"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-2">Subtítulo</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                                            placeholder="Detalhes"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'background' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-white/60 mb-3">Upload de Fundo</label>
                                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                                            <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-2" />
                                            <p className="text-sm text-white/60">Clique para enviar imagem</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10">
                            <button
                                onClick={() => onSave(output)} // Placeholder
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                            >
                                <Save className="w-5 h-5" />
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
