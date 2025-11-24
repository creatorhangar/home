'use client';

import { useState } from 'react';
import { ActionWrapper } from '@/components/guards/ActionWrapper';
import { Upload, Download, Trash2, ImageIcon } from 'lucide-react';

export default function RemoveFundoPage() {
    const [images, setImages] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [processedImages, setProcessedImages] = useState<string[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImages(prev => [...prev, ...files]);
    };

    const handleProcess = async () => {
        setProcessing(true);

        // Aqui você vai colocar sua lógica de processamento
        console.log('Processando', images.length, 'imagens...');

        // Simular processamento (substituir pela lógica real)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock de imagens processadas
        const mockProcessed = images.map((_, idx) =>
            `https://via.placeholder.com/300x300?text=Processada+${idx + 1}`
        );
        setProcessedImages(mockProcessed);

        setProcessing(false);
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleClear = () => {
        setImages([]);
        setProcessedImages([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                        Removedor de Fundo em Lote
                    </h1>
                    <p className="text-lg text-gray-600">
                        Remova o fundo de múltiplas imagens de uma vez. Processamento 100% local.
                    </p>
                </div>

                {/* Upload Area - LIVRE (não precisa de Pro) */}
                <div className="mb-8">
                    <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-semibold text-gray-700 mb-2">
                                Arraste imagens ou clique para selecionar
                            </p>
                            <p className="text-sm text-gray-500">
                                PNG, JPG, WEBP até 10MB cada
                            </p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </label>
                </div>

                {/* Lista de Imagens Selecionadas */}
                {images.length > 0 && (
                    <div className="mb-8 bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {images.length} {images.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
                            </h3>
                            <button
                                onClick={handleClear}
                                className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-2 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Limpar tudo
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((image, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                    <p className="text-xs text-gray-600 mt-2 truncate">
                                        {image.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botão de Processar - COM CADEADO PRO */}
                <ActionWrapper
                    requiresPro={true}
                    toolName="Processamento em Lote"
                    actionType="button"
                    onAction={handleProcess}
                >
                    <button
                        disabled={images.length === 0 || processing}
                        className="w-full bg-primary text-white py-5 rounded-xl font-bold text-lg hover:bg-primary/90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
                    >
                        {processing ? (
                            <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Processando {images.length} {images.length === 1 ? 'imagem' : 'imagens'}...
                            </>
                        ) : (
                            <>
                                <Download className="w-6 h-6" />
                                Processar {images.length} {images.length === 1 ? 'Imagem' : 'Imagens'}
                            </>
                        )}
                    </button>
                </ActionWrapper>

                {/* Resultados */}
                {processedImages.length > 0 && (
                    <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Imagens Processadas
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {processedImages.map((url, idx) => (
                                <div key={idx} className="relative group">
                                    <img
                                        src={url}
                                        alt={`Processada ${idx + 1}`}
                                        className="w-full aspect-square rounded-lg object-cover"
                                    />
                                    <button className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/90">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-bold text-blue-900 mb-2">💡 Como funciona?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Selecione uma ou várias imagens</li>
                        <li>• Clique em "Processar" (requer plano Pro)</li>
                        <li>• Baixe suas imagens sem fundo</li>
                        <li>• Tudo processado localmente no seu computador</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
