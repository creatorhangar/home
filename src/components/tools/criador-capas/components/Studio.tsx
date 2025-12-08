import React, { useState, useEffect, useRef } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay, type DragEndEvent } from '@dnd-kit/core';

import { Image as ImageIcon, Type, Layout as LayoutIcon, Settings, Download, ChevronLeft, RefreshCw, Sparkles, Edit2 } from 'lucide-react';
import { CanvasRenderer } from '../core/engine/CanvasRenderer';
import type { ImageFile, ProductInfo, CapaTemplate, CanvasLayout, CanvasElement, ModularLabelConfig } from '../types';
import { allCapaTemplates, getRecommendedLayouts } from '../templates/capas';
import { getLabelConfig } from '../core/engine/labelStyles';

interface StudioProps {
    images: ImageFile[];
    productInfo: ProductInfo;
    initialTemplate?: CapaTemplate;
    initialLabelConfig?: ModularLabelConfig;
    onLabelConfigChange?: (config: ModularLabelConfig) => void;
    onBack: () => void;
}

export function Studio({ images: initialImages, productInfo, initialTemplate, initialLabelConfig, onLabelConfigChange, onBack }: StudioProps) {
    const [images, setImages] = useState<ImageFile[]>(initialImages);
    const [localProductInfo, setLocalProductInfo] = useState<ProductInfo>(productInfo);
    const [selectedTemplate, setSelectedTemplate] = useState<CapaTemplate>(initialTemplate || allCapaTemplates[0]);
    const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
    const [currentLayout, setCurrentLayout] = useState<CanvasLayout | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'templates' | 'images' | 'text' | 'labels' | 'settings' | 'edit'>('templates');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [labelConfig, setLabelConfig] = useState<ModularLabelConfig>(initialLabelConfig || getLabelConfig('modern'));

    // Sync label config changes to parent
    useEffect(() => {
        if (onLabelConfigChange) {
            onLabelConfigChange(labelConfig);
        }
    }, [labelConfig, onLabelConfigChange]);
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '9:16' | 'landscape'>('1:1');
    const [spacing, setSpacing] = useState(0.5); // 0.0 to 1.0
    const [refreshKey, setRefreshKey] = useState(0);

    // Recommendations & Filtering
    const [recommendations, setRecommendations] = useState<CapaTemplate[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Canvas container ref for scaling calculations
    const containerRef = useRef<HTMLDivElement>(null);

    // Update recommendations when images change
    useEffect(() => {
        const recs = getRecommendedLayouts(images.length, productInfo.tags || []);
        setRecommendations(recs);
        // Select first recommendation if current template is invalid for new count
        if (selectedTemplate.minImages > images.length || selectedTemplate.maxImages < images.length) {
            if (recs.length > 0) setSelectedTemplate(recs[0]);
        }
    }, [images.length, localProductInfo.tags]);

    const [showText, setShowText] = useState(true);
    const [showPreview, setShowPreview] = useState(true);
    const [debouncedProductInfo, setDebouncedProductInfo] = useState<ProductInfo>(productInfo);

    // Debounce product info updates
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedProductInfo(localProductInfo);
        }, 300);
        return () => clearTimeout(timer);
    }, [localProductInfo]);

    // Generate preview when template or images change
    useEffect(() => {
        generatePreview();
    }, [selectedTemplate, images, debouncedProductInfo, aspectRatio, spacing, refreshKey, showText, labelConfig]);

    const generatePreview = async () => {
        setIsGenerating(true);
        try {
            // Calculate dimensions based on aspect ratio
            let width = 2000;
            let height = 2000;

            switch (aspectRatio) {
                case '1:1': width = 2000; height = 2000; break;
                case '4:5': width = 2000; height = 2500; break;
                case '9:16': width = 1440; height = 2560; break;
                case 'landscape': width = 2500; height = 1667; break;
            }

            // 1. Get Layout with Options
            const layout = selectedTemplate.layoutFn(images, images.length, debouncedProductInfo, width, height, {
                spacing: spacing,
                chaos: 0.5,
                seed: refreshKey, // Use refreshKey as seed for main view
                showText: showText
            });

            // Handle Text Toggle & Label Config
            if (!showText) {
                layout.etiqueta = undefined;
            } else if (layout.etiqueta) {
                // Merge layout position with active label config
                layout.etiqueta = {
                    ...labelConfig,
                    x: layout.etiqueta.x,
                    y: layout.etiqueta.y,
                    width: layout.etiqueta.width,
                    height: layout.etiqueta.height,
                    // Sync text with product info
                    textStrip: {
                        ...labelConfig.textStrip,
                        texts: {
                            ...labelConfig.textStrip.texts,
                            center: debouncedProductInfo.name || labelConfig.textStrip.texts.center,
                            bottom: debouncedProductInfo.price || labelConfig.textStrip.texts.bottom
                        }
                    }
                };
            }

            setCurrentLayout(layout);

            // 2. Render (Low Res for Preview)
            const renderer = new CanvasRenderer();
            // Scale 0.4 = 800px width (much faster than 2000px)
            const canvas = await renderer.render(layout, 0.4);
            setCanvasUrl(canvas.toDataURL('image/jpeg', 0.8));
        } catch (error) {
            console.error("Error generating preview:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRandomize = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            // Check if dropped on a canvas slot
            if (String(over.id).startsWith('slot-')) {
                const slotIndex = parseInt(String(over.id).replace('slot-', ''));
                const draggedImageId = active.id;
                const draggedImageIndex = images.findIndex(img => img.id === draggedImageId);

                if (draggedImageIndex !== -1) {
                    const newImages = [...images];
                    const [movedImage] = newImages.splice(draggedImageIndex, 1);
                    newImages.splice(slotIndex, 0, movedImage);
                    setImages(newImages);
                }
            }
        }
    };

    // Filter templates
    const categories = ['all', 'modern', 'elegant', 'vintage', 'playful', 'minimal'];
    const filteredTemplates = selectedCategory === 'all'
        ? allCapaTemplates
        : allCapaTemplates.filter(t => t.style === selectedCategory);

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex h-[calc(100vh-80px)] bg-background text-white overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50">
                {/* Left Sidebar - Tools */}
                <div className="w-16 flex flex-col items-center py-6 border-r border-white/10 bg-background-secondary/80 backdrop-blur-xl z-10">
                    <ToolButton icon={<LayoutIcon />} label="Templates" active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
                    <ToolButton icon={<ImageIcon />} label="Images" active={activeTab === 'images'} onClick={() => setActiveTab('images')} />
                    <ToolButton icon={<Type />} label="Text" active={activeTab === 'text'} onClick={() => setActiveTab('text')} />
                    <ToolButton icon={<Sparkles />} label="Labels" active={activeTab === 'labels'} onClick={() => setActiveTab('labels')} />
                    <ToolButton icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    {activeId && <ToolButton icon={<Edit2 />} label="Edit" active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} />}
                </div>

                {/* Secondary Sidebar - Content */}
                <div className="w-96 border-r border-white/10 bg-background-secondary/50 backdrop-blur-xl overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="p-6 flex-1">
                        <h3 className="text-lg font-bold mb-4 capitalize flex items-center gap-2 font-heading">
                            {activeTab === 'templates' && <LayoutIcon size={18} className="text-primary" />}
                            {activeTab === 'images' && <ImageIcon size={18} className="text-primary" />}
                            {activeTab}
                        </h3>

                        {activeTab === 'templates' && (
                            <div className="space-y-8">
                                {/* Recommendations */}
                                {recommendations.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-primary font-medium">
                                            <Sparkles size={16} />
                                            <span>Recommended for You</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {recommendations.slice(0, 4).map(t => (
                                                <TemplateCard
                                                    key={`rec-${t.id}`}
                                                    template={t}
                                                    images={images}
                                                    isSelected={selectedTemplate.id === t.id}
                                                    onClick={() => setSelectedTemplate(t)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* All Templates */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-white/70">All Layouts</span>
                                        {/* Category Filter */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setSelectedCategory(cat)}
                                                    className={`
                                                        px-3 py-1 rounded-full text-xs font-medium transition-all capitalize whitespace-nowrap
                                                        ${selectedCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'}
                                                    `}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Template Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {filteredTemplates
                                            .filter(t => t.minImages <= images.length && t.maxImages >= images.length)
                                            .map(t => (
                                                <TemplateCard
                                                    key={t.id}
                                                    template={t}
                                                    images={images}
                                                    isSelected={selectedTemplate.id === t.id}
                                                    onClick={() => setSelectedTemplate(t)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'images' && (
                            <div className="grid grid-cols-3 gap-3">
                                {images.map(img => (
                                    <DraggableImage
                                        key={img.id}
                                        image={img}
                                        onClick={() => {
                                            setActiveId(img.id);
                                            setActiveTab('edit');
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {activeTab === 'text' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                    <span className="text-sm font-medium text-white">Show Text Label</span>
                                    <button
                                        onClick={() => setShowText(!showText)}
                                        className={`
                                            w-12 h-6 rounded-full transition-colors relative
                                            ${showText ? 'bg-primary' : 'bg-white/20'}
                                        `}
                                    >
                                        <div className={`
                                            w-4 h-4 rounded-full bg-white absolute top-1 transition-transform
                                            ${showText ? 'left-7' : 'left-1'}
                                        `} />
                                    </button>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/70 mb-2 block">Main Title</label>
                                    <input
                                        type="text"
                                        value={localProductInfo.name}
                                        onChange={(e) => setLocalProductInfo(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none transition-colors"
                                        placeholder="Enter title..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/70 mb-2 block">Subtitle / Price</label>
                                    <input
                                        type="text"
                                        value={localProductInfo.price || ''}
                                        onChange={(e) => setLocalProductInfo(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none transition-colors"
                                        placeholder="Enter subtitle..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-white/70 mb-2 block">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={localProductInfo.tags?.join(', ') || ''}
                                        onChange={(e) => setLocalProductInfo(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-primary outline-none transition-colors"
                                        placeholder="modern, vintage, etc..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'labels' && (
                            <div className="space-y-6">
                                {/* Label Type Toggle (Cover vs Showcase) */}
                                <div>
                                    <label className="text-sm font-medium text-white/70 mb-2 block">Label Type</label>
                                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                                        <button
                                            onClick={() => setLabelConfig(prev => ({ ...prev, variant: 'cover' }))}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${labelConfig.variant === 'cover' ? 'bg-primary text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
                                        >
                                            Cover (Hero)
                                        </button>
                                        <button
                                            onClick={() => setLabelConfig(prev => ({ ...prev, variant: 'showcase' }))}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${labelConfig.variant !== 'cover' ? 'bg-primary text-white shadow-sm' : 'text-white/60 hover:text-white'}`}
                                        >
                                            Showcase (Info)
                                        </button>
                                    </div>
                                </div>

                                {/* Style Selector */}
                                <div>
                                    <label className="text-sm font-medium text-white/70 mb-3 block">Label Style</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['vintage', 'modern', 'luxury', 'playful', 'geometric', 'boho'].map(style => (
                                            <button
                                                key={style}
                                                onClick={() => {
                                                    const id = style.toLowerCase();
                                                    const newConfig = getLabelConfig(id);
                                                    setLabelConfig(prev => ({ ...newConfig, variant: prev.variant }));
                                                }}
                                                className={`
                                                    px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-all
                                                    ${labelConfig.styleId === style.toLowerCase()
                                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'}
                                                `}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Components Toggles */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-white/70 block">Components</label>

                                    {/* Badge Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-sm text-white">Badge / Logo</span>
                                        <button
                                            onClick={() => setLabelConfig(prev => ({ ...prev, badge: { ...prev.badge, enabled: !prev.badge.enabled } }))}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${labelConfig.badge.enabled ? 'bg-primary' : 'bg-white/20'}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${labelConfig.badge.enabled ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Text Strip Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-sm text-white">Main Text Strip</span>
                                        <button
                                            onClick={() => setLabelConfig(prev => ({ ...prev, textStrip: { ...prev.textStrip, enabled: !prev.textStrip.enabled } }))}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${labelConfig.textStrip.enabled ? 'bg-primary' : 'bg-white/20'}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${labelConfig.textStrip.enabled ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {/* Brand Toggle */}
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-sm text-white">Brand Name</span>
                                        <button
                                            onClick={() => setLabelConfig(prev => ({ ...prev, brand: { ...prev.brand, enabled: !prev.brand.enabled } }))}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${labelConfig.brand.enabled ? 'bg-primary' : 'bg-white/20'}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${labelConfig.brand.enabled ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Component Specific Controls */}
                                {labelConfig.textStrip.enabled && (
                                    <div className="space-y-3 pt-4 border-t border-white/10">
                                        <label className="text-sm font-medium text-white/70 block">Text Strip Options</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['solid', 'ribbon', 'blur', 'outline', 'double-border'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setLabelConfig(prev => ({ ...prev, textStrip: { ...prev.textStrip, style: s as any } }))}
                                                    className={`
                                                        px-2 py-1 rounded text-[10px] capitalize border transition-all
                                                        ${labelConfig.textStrip.style === s
                                                            ? 'bg-white text-black border-white'
                                                            : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'}
                                                    `}
                                                >
                                                    {s.replace('-', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Text Strip Position */}
                                {labelConfig.textStrip.enabled && (
                                    <div className="pt-4 border-t border-white/10">
                                        <label className="text-sm font-medium text-white/70 mb-2 block">Position</label>
                                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                                            {['top', 'center', 'bottom'].map(pos => (
                                                <button
                                                    key={pos}
                                                    onClick={() => setLabelConfig(prev => ({
                                                        ...prev,
                                                        textStrip: { ...prev.textStrip, position: pos as any }
                                                    }))}
                                                    className={`
                                                        flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize
                                                        ${labelConfig.textStrip.position === pos
                                                            ? 'bg-primary text-white shadow-sm'
                                                            : 'text-white/60 hover:text-white'}
                                                    `}
                                                >
                                                    {pos}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Opacity Slider */}
                                <div className="pt-4 border-t border-white/10">
                                    <label className="text-sm font-medium text-white/70 mb-2 block">Text Strip Opacity</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={labelConfig.textStrip.opacity ?? 1}
                                        onChange={(e) => setLabelConfig(prev => ({
                                            ...prev,
                                            textStrip: { ...prev.textStrip, opacity: parseFloat(e.target.value) }
                                        }))}
                                        className="w-full accent-primary"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                {/* Aspect Ratio */}
                                <div>
                                    <label className="text-sm font-medium text-white/70 mb-2 block">Aspect Ratio</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {(['1:1', '4:5', '9:16', 'landscape'] as const).map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => setAspectRatio(ratio)}
                                                className={`
                                                    px-3 py-1.5 text-xs font-medium rounded-md transition-all
                                                    ${aspectRatio === ratio ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}
                                                `}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Spacing Slider */}
                                <div>
                                    <label className="text-sm font-medium text-white/70 mb-2 block">Spacing / Spread</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={spacing}
                                        onChange={(e) => setSpacing(parseFloat(e.target.value))}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-white/40 mt-1">
                                        <span>Tight</span>
                                        <span>Loose</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Edit Tab (Always visible but with empty state) */}
                        {activeTab === 'edit' && (
                            <div className="space-y-6">
                                {!activeId ? (
                                    <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10 border-dashed">
                                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Edit2 size={20} className="text-white/50" />
                                        </div>
                                        <p className="text-sm font-medium text-white">No Image Selected</p>
                                        <p className="text-xs text-white/50 mt-1">Click on an image in the grid to edit it.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10 mb-4">
                                            <p className="text-xs text-white/60 mb-1">Selected Image</p>
                                            <div className="w-full h-20 bg-black/20 rounded overflow-hidden">
                                                <img
                                                    src={images.find(i => i.id === activeId)?.url}
                                                    className="w-full h-full object-contain"
                                                    alt="Selected"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-white/70 mb-2 block">Scale</label>
                                            <input
                                                type="range"
                                                min="0.5"
                                                max="2"
                                                step="0.1"
                                                defaultValue="1"
                                                onChange={(e) => {
                                                    // TODO: Implement live update
                                                    console.log("Scale:", e.target.value);
                                                }}
                                                className="w-full accent-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-white/70 mb-2 block">Rotation</label>
                                            <input
                                                type="range"
                                                min="-180"
                                                max="180"
                                                step="1"
                                                defaultValue="0"
                                                onChange={(e) => {
                                                    console.log("Rotation:", e.target.value);
                                                }}
                                                className="w-full accent-primary"
                                            />
                                        </div>
                                        <div className="pt-4 border-t border-white/10">
                                            <button
                                                className="w-full py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
                                                onClick={() => {
                                                    setImages(prev => prev.filter(i => i.id !== activeId));
                                                    setActiveId(null);
                                                }}
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-white/10 flex gap-2">
                        <button onClick={onBack} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 flex-1">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <button className="btn-primary text-sm px-4 py-2 flex items-center gap-2 flex-1 shadow-lg shadow-primary/20">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 flex flex-col bg-background-tertiary/30">
                    {/* Top Controls */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-background-secondary/30 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <h2 className="font-heading font-bold text-lg">{selectedTemplate.name}</h2>
                            <span className="text-xs text-white/40 capitalize">{selectedTemplate.style}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className={`btn-secondary text-sm px-3 py-2 flex items-center gap-2 ${!showPreview ? 'bg-primary/20 text-primary' : ''}`}
                                title={showPreview ? "Hide Preview" : "Show Preview"}
                            >
                                {showPreview ? <ImageIcon size={16} /> : <ImageIcon size={16} className="opacity-50" />}
                                <span className="hidden sm:inline">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                            </button>
                            <button
                                onClick={handleRandomize}
                                className="btn-secondary text-sm px-3 py-2 flex items-center gap-2"
                                title="Randomize layout"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden" ref={containerRef}>
                        <div className="relative max-w-full max-h-full">
                            {isGenerating && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg z-20">
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        <p className="text-sm text-white/60">Generating...</p>
                                    </div>
                                </div>
                            )}

                            {canvasUrl && showPreview && (
                                <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/50">
                                    <img
                                        src={canvasUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-[calc(100vh-250px)] object-contain"
                                    />

                                    {/* Drop zones overlay */}
                                    {currentLayout && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="relative w-full h-full pointer-events-auto">
                                                {currentLayout.elements
                                                    .filter(el => el.type === 'image')
                                                    .map((el, idx) => (
                                                        <DropZone
                                                            key={`slot-${idx}`}
                                                            id={`slot-${idx}`}
                                                            element={el}
                                                            layoutWidth={currentLayout.width}
                                                            layoutHeight={currentLayout.height}
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <DragOverlay>
                {activeId ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary shadow-xl">
                        <img src={images.find(i => i.id === activeId)?.url} className="w-full h-full object-cover" />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function ToolButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-10 h-10 mb-4 rounded-xl flex items-center justify-center transition-all
                ${active ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-white/50 hover:text-white hover:bg-white/10'}
            `}
            title={label}
        >
            {icon}
        </button>
    );
}

function TemplateCard({ template, images, isSelected, onClick }: { template: CapaTemplate, images: ImageFile[], isSelected: boolean, onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`
                cursor-pointer rounded-lg overflow-hidden border transition-all group relative
                ${isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-white/10 hover:border-white/30'}
            `}
        >
            <div className="aspect-square bg-gray-800 relative overflow-hidden">
                <LazyTemplatePreview template={template} images={images} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                    <span className="text-[10px] text-white/80">{template.minImages}-{template.maxImages} images</span>
                </div>
            </div>
            <div className="p-2 bg-gray-800/50">
                <div className="text-xs font-medium truncate">{template.name}</div>
                <div className="text-[10px] text-white/40 truncate capitalize">{template.style}</div>
            </div>
        </div>
    );
}

function LazyTemplatePreview({ template, images }: { template: CapaTemplate, images: ImageFile[] }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const generate = async () => {
            try {
                // Use a shared renderer instance if possible, or just create one.
                const renderer = new CanvasRenderer();

                // Create dummy images for preview using REAL user images if available
                // Ensure we have enough images for the template
                const imagesToUse = images && images.length > 0 ? images : [];

                const dummyImages: ImageFile[] = Array(template.maxImages).fill(null).map((_, i) => {
                    if (imagesToUse.length > 0) {
                        const sourceImg = imagesToUse[i % imagesToUse.length];
                        return {
                            ...sourceImg,
                            id: `preview-${template.id}-${i}`
                        };
                    }
                    return {
                        id: `dummy-${i}`,
                        file: new File([], 'dummy'),
                        url: `https://picsum.photos/seed/${template.id}-${i}/200/200`,
                        width: 200,
                        height: 200
                    };
                });

                // Generate layout at FULL size (1080) then scale down for rendering
                // This ensures font sizes and proportions are correct
                const layout = template.layoutFn(dummyImages, Math.min(4, template.maxImages), { name: 'Preview' }, 1080, 1080);

                // Render at 0.2 scale (approx 216px)
                const canvas = await renderer.render(layout, 0.2);
                if (mounted) {
                    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.7));
                    setLoading(false);
                }
            } catch (e) {
                console.error("Preview gen error", e);
                if (mounted) setLoading(false);
            }
        };

        // Debounce slightly to prevent mass generation on rapid scroll/mount
        const timer = setTimeout(generate, 100);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [template.id, images]); // Re-run if images change

    if (loading) {
        return <div className="w-full h-full bg-white/5 animate-pulse" />;
    }

    return (
        <img src={previewUrl || template.preview} alt={template.name} className="w-full h-full object-cover" />
    );
}

function DraggableImage({ image, onClick }: { image: ImageFile, onClick?: () => void }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: image.id,
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
        >
            <img src={image.url} alt="Upload" className="w-full h-full object-cover" />

            {/* Hover Edit Button */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <button
                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-primary hover:scale-110 transition-all pointer-events-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick?.();
                    }}
                >
                    <Edit2 size={16} />
                </button>
            </div>
        </div>
    );
}

function DropZone({ id, element, layoutWidth, layoutHeight }: { id: string, element: CanvasElement, layoutWidth: number, layoutHeight: number }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const style: React.CSSProperties = {
        position: 'absolute',
        left: `${(element.x / layoutWidth) * 100}%`,
        top: `${(element.y / layoutHeight) * 100}%`,
        width: `${(element.width / layoutWidth) * 100}%`,
        height: `${(element.height / layoutHeight) * 100}%`,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
        zIndex: 10,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                transition-colors duration-200 rounded-sm
                ${isOver ? 'bg-primary/30 border-2 border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'hover:bg-white/10 hover:border hover:border-white/30'}
            `}
        />
    );
}

