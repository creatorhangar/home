'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { TextInputForm } from './components/TextInputForm';
import { Studio } from './components/Studio';
import { ResultsGallery } from './components/ResultsGallery';
import { ImageProcessor } from './core/engine/ImageProcessor';
import type { ImageFile, ProductInfo, GeneratorOptions, CapaTemplate, ModularLabelConfig } from './types';
import { allCapaTemplates } from './templates/capas';
import { getLabelConfig } from './core/engine/labelStyles';

type Step = 'upload' | 'results' | 'studio';

export default function CriaCapaTool() {
  const [step, setStep] = useState<Step>('upload');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: '',
    subtitle: '',
    description: '',
  });
  const [generatorOptions, setGeneratorOptions] = useState<GeneratorOptions>({
    mode: 'quick',
    aspectRatio: '1:1', // Default to square
    quickOptions: {
      generateAll: true,
      randomMockups: 5
    }
  });
  const [selectedTemplate, setSelectedTemplate] = useState<CapaTemplate>(allCapaTemplates[0]);
  const [labelConfig, setLabelConfig] = useState<ModularLabelConfig>(getLabelConfig('modern'));

  const handleStart = () => {
    if (images.length === 0) return;
    setStep('results');
  };

  const handleEditTemplate = (template: CapaTemplate) => {
    setSelectedTemplate(template);
    setStep('studio');
  };

  const handleReset = () => {
    // Limpar URLs
    ImageProcessor.cleanupImageUrls(images);
    setImages([]);
    setProductInfo({ name: '', subtitle: '', description: '' });
    setStep('upload');
  };

  return (
    <div className="text-gray-900">
      {/* Tool Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Gerador de Capas</h1>
          <p className="text-sm text-gray-500">Crie capas para seus produtos digitais</p>
        </div>
        {step !== 'upload' && (
          <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
            Nova Coleção
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] p-1">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 space-y-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif italic mb-2 text-gray-800">
                  Atelier Digital
                </h2>
                <p className="text-lg text-gray-500 font-light">
                  Crie sua vitrine em segundos
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Upload */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
                      Suas Imagens
                    </h3>
                    <ImageUploader
                      images={images}
                      onImagesChange={setImages}
                      minImages={1}
                      maxImages={50}
                    />
                  </div>
                </div>

                {/* Right Column: Info & Actions */}
                <div className="lg:col-span-5 space-y-6 sticky top-4">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
                      Detalhes da Coleção
                    </h3>

                    <TextInputForm
                      productInfo={productInfo}
                      onProductInfoChange={setProductInfo}
                      onNext={handleStart}
                      generatorOptions={generatorOptions}
                      onOptionsChange={setGeneratorOptions}
                      isValid={images.length >= 1 && productInfo.name.length > 0}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full bg-gray-900 rounded-lg overflow-hidden" // Keep dark mode for results gallery? Or adapt? Keeping dark for contrast.
            >
              <ResultsGallery
                images={images}
                productInfo={productInfo}
                labelConfig={labelConfig}
                onEdit={handleEditTemplate}
                onBack={() => setStep('upload')}
              />
            </motion.div>
          )}

          {step === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full bg-gray-900 rounded-lg overflow-hidden"
            >
              <Studio
                images={images}
                productInfo={productInfo}
                initialTemplate={selectedTemplate}
                initialLabelConfig={labelConfig}
                onLabelConfigChange={setLabelConfig}
                onBack={() => setStep('results')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
