import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { TextInputForm } from './components/TextInputForm';
import { Studio } from './components/Studio';
import { ResultsGallery } from './components/ResultsGallery';
import { ImageProcessor } from './core/engine/ImageProcessor';
import type { ImageFile, ProductInfo, GeneratorOptions, CapaTemplate, ModularLabelConfig } from './types';
import { allCapaTemplates } from './templates/capas';
import { getLabelConfig } from './core/engine/labelStyles';

type Step = 'upload' | 'results' | 'studio';

function App() {
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
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent-purple">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-luxury tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
                CriaCapa <span className="text-primary font-serif italic">Pro</span>
              </h1>
              <p className="text-xs text-white/60 tracking-[0.2em] uppercase mt-1">Studio Edition</p>
            </div>
          </div>

          {step !== 'upload' && (
            <button onClick={handleReset} className="btn-secondary text-sm">
              Nova Coleção
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="text-center mb-12">
                <h2 className="text-5xl font-serif italic mb-4 text-white">
                  Atelier Digital
                </h2>
                <p className="text-xl text-white/60 font-light">
                  Crie sua vitrine em segundos
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Upload */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
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
                <div className="lg:col-span-5 space-y-6 sticky top-24">
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
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
              className="h-full"
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
              className="h-full"
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
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/40 text-sm">
          <p>CriaCapa Pro - Gerador de Capas para Marketplaces Digitais</p>
          <p className="mt-2">
            Ideal para vendedores do Etsy, Gumroad, Creative Market
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
