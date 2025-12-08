import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Edit, Download, RefreshCw, ChevronLeft, Check, Wand2 } from 'lucide-react';
import { VideoStudio } from './VideoStudio';
import { CanvasRenderer } from '../core/engine/CanvasRenderer';
import { getRecommendedLayouts } from '../templates/capas';
import type { ImageFile, ProductInfo, CapaTemplate, ModularLabelConfig } from '../types';
import JSZip from 'jszip';

interface ResultsGalleryProps {
    images: ImageFile[];
    productInfo: ProductInfo;
    labelConfig: ModularLabelConfig;
    onEdit: (template: CapaTemplate) => void;
    onBack: () => void;
}

interface GeneratedPreview {
    template: CapaTemplate;
    url: string;
    blob: Blob;
}

export function ResultsGallery({ images, productInfo, labelConfig, onEdit, onBack }: ResultsGalleryProps) {
    const [generatedPreviews, setGeneratedPreviews] = useState<GeneratedPreview[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const generationIdRef = useRef(0);
    const [showVideoStudio, setShowVideoStudio] = useState(false);
    const [videoImages, setVideoImages] = useState<string[]>([]);

    const handleOpenVideoStudio = () => {
        const imagesToUse = selectedIds.size > 0
            ? generatedPreviews.filter(p => selectedIds.has(p.template.id)).map(p => p.url)
            : generatedPreviews.map(p => p.url);

        if (imagesToUse.length === 0) {
            setVideoImages(images.map(img => img.url));
        } else {
            setVideoImages(imagesToUse);
        }
        setShowVideoStudio(true);
    };

    useEffect(() => {
        // Cleanup previous generation
        return () => {
            generationIdRef.current += 1;
        };
    }, []);

    useEffect(() => {
        generateAllPreviews();
    }, [images, productInfo, labelConfig]);

    const generateAllPreviews = async () => {
        const currentGenId = generationIdRef.current + 1;
        generationIdRef.current = currentGenId;

        console.log(`Starting generation #${currentGenId}...`, { imagesCount: images.length, tags: productInfo.tags });
        setIsLoading(true);
        setGeneratedPreviews([]); // Clear previous

        try {
            // Generate more options for the gallery
            const recommendations = getRecommendedLayouts(images.length, productInfo.tags || []);

            // Deduplicate recommendations
            const uniqueRecommendations = Array.from(new Map(recommendations.map(item => [item.id, item])).values());
            console.log("Recommendations:", uniqueRecommendations.length);

            // Take top 20 recommendations
            const templatesToRender = uniqueRecommendations.slice(0, 20);
            console.log("Templates to render:", templatesToRender.length);

            const renderer = new CanvasRenderer();

            for (const template of templatesToRender) {
                // Check if this generation is still valid
                if (generationIdRef.current !== currentGenId) {
                    console.log(`Generation #${currentGenId} aborted.`);
                    return;
                }

                try {
                    // Yield to main thread
                    await new Promise(resolve => setTimeout(resolve, 0));

                    // Use thumbnails for preview generation if available to speed up rendering
                    const previewImages = images.map(img => ({
                        ...img,
                        url: img.thumbnail || img.url
                    }));

                    // Generate layout at full size to ensure correct proportions/font sizes
                    const layout = template.layoutFn(previewImages, images.length, productInfo, 1080, 1080);

                    // Apply Global Label Config
                    if (layout.etiqueta) {
                        layout.etiqueta = {
                            ...labelConfig,
                            // Preserve layout positioning
                            x: layout.etiqueta.x,
                            y: layout.etiqueta.y,
                            width: layout.etiqueta.width,
                            height: layout.etiqueta.height,
                            // Sync text with product info
                            textStrip: {
                                ...labelConfig.textStrip,
                                texts: {
                                    ...labelConfig.textStrip.texts,
                                    center: productInfo.name || labelConfig.textStrip.texts.center,
                                    bottom: productInfo.price || labelConfig.textStrip.texts.bottom
                                }
                            }
                        };
                    }

                    // Render at 0.3 scale (approx 324x324) for thumbnail
                    const canvas = await renderer.render(layout, 0.3);

                    // Get Blob for download
                    const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.7));
                    const url = URL.createObjectURL(blob);

                    // Update state incrementally, checking for validity and duplicates
                    if (generationIdRef.current === currentGenId) {
                        setGeneratedPreviews(prev => {
                            // Avoid duplicates
                            if (prev.some(p => p.template.id === template.id)) return prev;
                            return [...prev, { template, url, blob }];
                        });
                    }
                } catch (e) {
                    console.error(`Failed to render preview for ${template.name}`, e);
                }
            }
        } catch (err) {
            console.error("Fatal error in generateAllPreviews:", err);
        } finally {
            if (generationIdRef.current === currentGenId) {
                setIsLoading(false);
                console.log(`Generation #${currentGenId} complete.`);
            }
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleDownload = (preview: GeneratedPreview) => {
        const link = document.createElement('a');
        link.href = preview.url;
        link.download = `${productInfo.name.replace(/\s+/g, '-').toLowerCase()} -${preview.template.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBatchDownload = async () => {
        if (selectedIds.size === 0) return;
        setIsDownloading(true);

        const zip = new JSZip();
        const folder = zip.folder("collection");

        generatedPreviews.forEach(preview => {
            if (selectedIds.has(preview.template.id)) {
                folder?.file(`${preview.template.id}.jpg`, preview.blob);
            }
        });

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "my-collection.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
    };

    const selectAll = () => {
        if (selectedIds.size === generatedPreviews.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(generatedPreviews.map(p => p.template.id)));
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col relative">
            {showVideoStudio && (
                <div className="fixed inset-0 z-50">
                    <VideoStudio
                        images={videoImages}
                        onClose={() => setShowVideoStudio(false)}
                    />
                </div>
            )}

            {/* Header Actions */}
            <div className="flex items-center justify-between bg-background-secondary/50 p-4 rounded-xl backdrop-blur-md border border-white/10 sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="btn-secondary p-2 rounded-lg hover:bg-white/10">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold font-heading">Gallery</h2>
                        <p className="text-xs text-white/60">{generatedPreviews.length} designs generated</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenVideoStudio}
                        className="btn-primary px-4 py-2 text-sm flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-none shadow-lg shadow-purple-500/20"
                    >
                        <Wand2 size={16} />
                        Create Video
                    </button>

                    {selectedIds.size > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mr-4"
                        >
                            <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
                            <button
                                onClick={handleBatchDownload}
                                disabled={isDownloading}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                            >
                                {isDownloading ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
                                Download Selected
                            </button>
                        </motion.div>
                    )}

                    <button onClick={selectAll} className="text-xs text-white/60 hover:text-white px-3 py-2">
                        {selectedIds.size === generatedPreviews.length ? 'Deselect All' : 'Select All'}
                    </button>

                    <button onClick={generateAllPreviews} className="btn-secondary p-2" title="Regenerate">
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {isLoading && generatedPreviews.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse border border-white/10" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                        {generatedPreviews.map((item, idx) => {
                            const isSelected = selectedIds.has(item.template.id);
                            return (
                                <motion.div
                                    key={item.template.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`
                                        group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                                        ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-white/20'}
                                    `}
                                    onClick={() => toggleSelection(item.template.id)}
                                >
                                    <img
                                        src={item.url}
                                        alt={item.template.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Selection Indicator */}
                                    <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white border-primary' : 'bg-black/40 text-transparent hover:bg-black/60'} `}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        <div className="flex gap-2 justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEdit(item.template); }}
                                                className="bg-white text-black p-2 rounded-lg hover:bg-primary hover:text-white transition-colors shadow-lg"
                                                title="Edit in Studio"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                                                className="bg-white text-black p-2 rounded-lg hover:bg-primary hover:text-white transition-colors shadow-lg"
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Badge */}
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium text-white/80 border border-white/10 pointer-events-none">
                                        {item.template.style}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* Floating Action Button for Video Studio */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenVideoStudio}
                className="fixed bottom-8 right-8 z-40 btn-primary p-4 rounded-full shadow-2xl shadow-purple-500/40 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-2"
            >
                <Wand2 size={24} />
                <span className="font-bold pr-2">Create Video</span>
            </motion.button>
        </div>
    );
}
