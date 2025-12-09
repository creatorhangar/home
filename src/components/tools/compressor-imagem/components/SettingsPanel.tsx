import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Settings, OutputFormat, ProcessingStatus, ImageFile, WatermarkSettings, Preset } from '../types';
import { Button } from './Button';
import { useI18n } from '../i18n';
import { Checkbox } from './Checkbox';
import { SparklesIcon, SpinnerIcon, ResizeIcon, RotateIcon, ContainIcon, CoverIcon, FillIcon, SmartFillIcon, PhotoIcon, SaveIcon, XCircleIcon, TrashIcon } from './icons';
import { ALL_OUTPUT_FORMATS } from '../constants';
import { Joystick } from './Joystick';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SettingsPanelProps {
    settings: Settings;
    onSettingsChange: (newSettings: Settings) => void;
    onApplyEdits: () => void;
    isProcessing: boolean;
    selectedCount: number;
    processedCount: number;
    totalInBatch: number;
    processingStatus: ProcessingStatus;
    previewFile: ImageFile | null;
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-light-border dark:border-border-gray">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
                <h3 className="font-bold text-dark-text dark:text-light-text">{title}</h3>
                <span className={`transform transition-transform duration-200 text-dark-gray dark:text-light-gray ${isOpen ? '' : '-rotate-90'}`}>▼</span>
            </button>
            {isOpen && <div className="p-4 pt-0 space-y-4">{children}</div>}
        </div>
    );
};

const PositionPicker: React.FC<{
    current: Settings['watermark']['position'];
    onChange: (position: Settings['watermark']['position']) => void;
    disabled: boolean;
}> = ({ current, onChange, disabled }) => {
    const positions: Settings['watermark']['position'][] = [
        'top-left', 'top-center', 'top-right',
        'center-left', 'center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right'
    ];
    return (
        <div className="grid grid-cols-3 gap-1">
            {positions.map((pos) => (
                <button
                    key={pos}
                    onClick={() => onChange(pos)}
                    disabled={disabled}
                    className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors border-2 ${current === pos ? 'bg-primary-action border-primary-action' : 'bg-transparent border-transparent hover:border-light-border dark:hover:border-border-gray'}`}
                >
                    <div className={`h-4 w-4 rounded-sm bg-dark-gray dark:bg-light-gray ${current === pos ? 'bg-white' : ''}`} />
                </button>
            ))}
        </div>
    );
};

const FitModeButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
}> = ({ label, isActive, onClick, disabled, children }) => {
    const activeClasses = 'bg-primary-action text-white';
    const inactiveClasses = 'bg-light-accent dark:bg-dark-bg hover:bg-light-border dark:hover:bg-border-gray';
    return (
        <button
            title={label}
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center h-10 w-10 transition duration-200 rounded-lg focus:shadow-outline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? activeClasses : inactiveClasses}`}
        >
            {children}
        </button>
    );
};

const applyWatermarkToCanvas = (ctx: CanvasRenderingContext2D, watermarkSettings: WatermarkSettings, imageWidth: number, imageHeight: number, watermarkBitmap?: HTMLImageElement) => {
    if (!watermarkSettings.enabled) return;
    
    ctx.globalAlpha = watermarkSettings.opacity;
    const { type, text, size, color, position, mosaic, angle, offsetX, offsetY } = watermarkSettings;

    if (type === 'text') {
        const fontSize = (size / 100) * imageWidth;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = color;

        if (mosaic) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textMetrics = ctx.measureText(text);
            const patternWidth = textMetrics.width * 1.5;
            const patternHeight = fontSize * 3; 
            const radAngle = angle * Math.PI / 180;
            for (let y = -patternHeight; y < imageHeight + patternHeight; y += patternHeight) {
                for (let x = -patternWidth; x < imageWidth + patternWidth; x += patternWidth) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(radAngle);
                    ctx.fillText(text, 0, 0);
                    ctx.restore();
                }
            }
            ctx.restore();
        } else {
            const margin = 0.02 * Math.min(imageWidth, imageHeight);
            let x, y;
            if (position.includes('left')) { x = margin; ctx.textAlign = 'left'; } 
            else if (position.includes('center')) { x = imageWidth / 2; ctx.textAlign = 'center'; } 
            else { x = imageWidth - margin; ctx.textAlign = 'right'; }

            if (position.includes('top')) { y = margin; ctx.textBaseline = 'top'; } 
            else if (position.includes('middle') || position === 'center') { y = imageHeight / 2; ctx.textBaseline = 'middle'; } 
            else { y = imageHeight - margin; ctx.textBaseline = 'bottom'; }
            
            x += (offsetX / 100) * imageWidth;
            y += (offsetY / 100) * imageHeight;
            ctx.fillText(text, x, y);
        }
    } else if (type === 'image' && watermarkBitmap) {
        const margin = 0.02 * Math.min(imageWidth, imageHeight);
        const watermarkWidth = (size / 100) * imageWidth;
        const watermarkHeight = watermarkWidth * (watermarkBitmap.height / watermarkBitmap.width);
        let x, y;
        if (position.includes('left')) x = margin;
        else if (position.includes('center')) x = (imageWidth - watermarkWidth) / 2;
        else x = imageWidth - watermarkWidth - margin;

        if (position.includes('top')) y = margin;
        else if (position.includes('middle') || position === 'center') y = (imageHeight - watermarkHeight) / 2;
        else y = imageHeight - watermarkHeight - margin;

        x += (offsetX / 100) * imageWidth;
        y += (offsetY / 100) * imageHeight;
        ctx.drawImage(watermarkBitmap, x, y, watermarkWidth, watermarkHeight);
    }
    ctx.globalAlpha = 1.0;
};

const LivePreview: React.FC<{ imageFile: ImageFile, settings: Settings }> = ({ imageFile, settings }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { t } = useI18n();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !imageFile) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageFile.previewUrl;
        
        let watermarkImg: HTMLImageElement | undefined;
        if (settings.watermark.enabled && settings.watermark.type === 'image' && settings.watermark.imageUrl) {
            watermarkImg = new Image();
            watermarkImg.crossOrigin = "anonymous";
            watermarkImg.src = settings.watermark.imageUrl;
        }

        const draw = () => {
            const sourceWidth = imageFile.originalWidth || img.width;
            const sourceHeight = imageFile.originalHeight || img.height;
            let targetWidth = sourceWidth;
            let targetHeight = sourceHeight;

            const { resize, resizeMode, resizeWidth, resizeHeight, resizeFit, rotation, watermark } = settings;

            if (resize) {
                if (resizeMode === 'percentage') {
                    const percentage = resizeWidth || 100;
                    if (percentage > 0 && percentage !== 100) {
                        targetWidth = sourceWidth * (percentage / 100);
                        targetHeight = sourceHeight * (percentage / 100);
                    }
                } else { // pixels mode
                     const w = resizeWidth;
                     const h = resizeHeight;
                     if (w && h) { targetWidth = w; targetHeight = h; } 
                     else if (w) { targetWidth = w; targetHeight = (w / sourceWidth) * sourceHeight; } 
                     else if (h) { targetHeight = h; targetWidth = (h / sourceHeight) * sourceWidth; }
                }
            }

            targetWidth = Math.max(1, Math.round(targetWidth));
            targetHeight = Math.max(1, Math.round(targetHeight));
            if (!isFinite(targetWidth) || !isFinite(targetHeight)) return;

            let canvasWidth = targetWidth;
            let canvasHeight = targetHeight;
            if (rotation === 90 || rotation === 270) {
                canvasWidth = targetHeight;
                canvasHeight = targetWidth;
            }

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.save();
            ctx.translate(canvasWidth / 2, canvasHeight / 2);
            if (rotation && rotation > 0) ctx.rotate(rotation * Math.PI / 180);
            ctx.translate(-targetWidth / 2, -targetHeight / 2);
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            ctx.restore();

            applyWatermarkToCanvas(ctx, watermark, canvasWidth, canvasHeight, watermarkImg);
        };
        
        img.onload = () => {
            if (watermarkImg) {
                watermarkImg.onload = draw;
                watermarkImg.onerror = draw; // Draw without watermark if it fails
            } else {
                draw();
            }
        };

    }, [imageFile, settings]);

    return (
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
    );
};


const PresetManager: React.FC<{
    settings: Settings;
    onSettingsChange: (s: Settings) => void;
}> = ({ settings, onSettingsChange }) => {
    const { t } = useI18n();
    const [presets, setPresets] = useLocalStorage<Preset[]>('image-converter-presets', []);
    const [selectedPresetId, setSelectedPresetId] = useState('');

    const handleSave = () => {
        const name = prompt(t('settings_panel.preset_prompt_name'));
        if (name) {
            const newPreset: Preset = { id: uuidv4(), name, settings };
            setPresets(p => [...p, newPreset]);
            setSelectedPresetId(newPreset.id);
        }
    };
    
    const handleDelete = () => {
        if(selectedPresetId && confirm(t('settings_panel.preset_confirm_delete'))) {
            setPresets(p => p.filter(preset => preset.id !== selectedPresetId));
            setSelectedPresetId('');
        }
    };

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const preset = presets.find(p => p.id === id);
        if(preset) {
            onSettingsChange(preset.settings);
            setSelectedPresetId(id);
        } else {
            setSelectedPresetId('');
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-dark-gray dark:text-light-gray">{t('settings_panel.presets')}</label>
            <div className="flex items-center gap-2">
                <select 
                    value={selectedPresetId}
                    onChange={handleSelect}
                    className="h-10 w-full text-dark-text dark:text-light-text bg-light-accent dark:bg-dark-bg border border-light-border dark:border-border-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-action text-sm px-2"
                >
                    <option value="">{t('settings_panel.preset_select')}</option>
                    {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button onClick={handleSave} title={t('settings_panel.preset_save')} className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-light-accent dark:bg-dark-bg rounded-lg hover:bg-light-border dark:hover:bg-border-gray transition-colors"><SaveIcon className="w-5 h-5"/></button>
                {selectedPresetId && <button onClick={handleDelete} title={t('settings_panel.preset_delete')} className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-light-accent dark:bg-dark-bg rounded-lg hover:bg-danger/10 text-danger transition-colors"><TrashIcon className="w-5 h-5"/></button>}
            </div>
        </div>
    );
};


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onApplyEdits, isProcessing, selectedCount, previewFile }) => {
    const { t } = useI18n();
    const watermarkImageInputRef = useRef<HTMLInputElement>(null);

    const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handlePdfSettingChange = <K extends keyof Settings['pdf']>(key: K, value: Settings['pdf'][K]) => {
        handleSettingChange('pdf', { ...settings.pdf, [key]: value });
    };
    
    const handleSettingsNumberChange = (key: keyof Settings, value: string) => {
      onSettingsChange({ ...settings, [key]: value === '' ? null : parseInt(value, 10) });
    };

    const handleWatermarkChange = <K extends keyof Settings['watermark']>(key: K, value: Settings['watermark'][K]) => {
        handleSettingChange('watermark', { ...settings.watermark, [key]: value });
    };
    
    const handleWatermarkNumberChange = (key: keyof Settings['watermark'], value: string) => {
        handleWatermarkChange(key, value === '' ? 0 : parseInt(value, 10));
    };

    const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (settings.watermark.imageUrl) {
                URL.revokeObjectURL(settings.watermark.imageUrl);
            }
            handleWatermarkChange('imageFile', file);
            handleWatermarkChange('imageUrl', URL.createObjectURL(file));
        }
    };
    
     const handleRotate = () => {
        const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
        const currentIndex = rotations.indexOf(settings.rotation);
        const nextIndex = (currentIndex + 1) % rotations.length;
        handleSettingChange('rotation', rotations[nextIndex]);
    };

    const commonLabelClass = "text-sm font-medium text-dark-gray dark:text-light-gray";
    const commonInputClass = "h-10 w-full text-dark-text dark:text-light-text bg-light-accent dark:bg-dark-bg border border-light-border dark:border-border-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-action text-sm px-2";
    const applyButtonText = selectedCount > 0
        ? t('action_bar.apply_edits_count', { count: selectedCount })
        : t('action_bar.apply_edits');

    return (
        <aside className="bg-light-panel dark:bg-dark-card rounded-xl shadow-md flex flex-col h-full">
            <header className="p-4 border-b border-light-border dark:border-border-gray">
                <h2 className="text-xl font-display font-bold text-dark-text dark:text-light-text">{t('action_bar.settings_title')}</h2>
            </header>

            <div className="flex-grow overflow-y-auto">
                <CollapsibleSection title={t('settings_panel.live_preview')} defaultOpen={true}>
                    <div className="aspect-video bg-light-accent dark:bg-dark-bg rounded-lg flex items-center justify-center text-dark-gray dark:text-light-gray overflow-hidden">
                        {previewFile ? (
                            <LivePreview imageFile={previewFile} settings={settings} />
                        ) : (
                            <div className="text-center p-4">
                                <PhotoIcon className="w-10 h-10 mx-auto" />
                                <p className="mt-2 text-sm font-medium">{t('settings_panel.live_preview_placeholder')}</p>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title={t('settings_panel.presets_section_title')} defaultOpen={false}>
                    <PresetManager settings={settings} onSettingsChange={onSettingsChange} />
                </CollapsibleSection>

                <CollapsibleSection title={t('action_bar.section_compress')}>
                    <div>
                        <label htmlFor="quality" className={commonLabelClass}>{t('action_bar.quality')} ({settings.quality})</label>
                        <input type="range" id="quality" min="1" max="100" value={settings.quality}
                            onChange={(e) => handleSettingChange('quality', parseInt(e.target.value))}
                            disabled={isProcessing}
                            className="w-full h-2 bg-light-accent dark:bg-border-gray rounded-lg appearance-none cursor-pointer range-thumb mt-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="outputFormat" className={commonLabelClass}>{t('action_bar.output_format')}</label>
                        <select id="outputFormat" value={settings.outputFormat}
                            onChange={(e) => handleSettingChange('outputFormat', e.target.value as OutputFormat)}
                            disabled={isProcessing}
                            className={`${commonInputClass} mt-1`}
                        >
                             {ALL_OUTPUT_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                     {settings.outputFormat === 'pdf' && (
                        <div className="space-y-4 pt-2">
                             <h4 className="font-bold text-dark-text dark:text-light-text text-sm">PDF Options</h4>
                            <div>
                                <label htmlFor="pdfPageSize" className={commonLabelClass}>{t('settings_panel.pdf_page_size')}</label>
                                <select id="pdfPageSize" value={settings.pdf.pageSize} onChange={(e) => handlePdfSettingChange('pageSize', e.target.value as any)} className={`${commonInputClass} mt-1`}>
                                    <option value="A4">A4</option>
                                    <option value="Letter">Letter</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="pdfOrientation" className={commonLabelClass}>{t('settings_panel.pdf_orientation')}</label>
                                <select id="pdfOrientation" value={settings.pdf.orientation} onChange={(e) => handlePdfSettingChange('orientation', e.target.value as any)} className={`${commonInputClass} mt-1`}>
                                    <option value="portrait">{t('settings_panel.pdf_portrait')}</option>
                                    <option value="landscape">{t('settings_panel.pdf_landscape')}</option>
                                </select>
                            </div>
                            <div>
                                <label className={commonLabelClass}>{t('settings_panel.pdf_image_fit')}</label>
                                 <div className="flex bg-light-accent dark:bg-dark-bg p-1 rounded-lg mt-1">
                                    <button onClick={() => handlePdfSettingChange('imageFit', 'contain')} className={`flex-1 py-1 rounded-md text-sm font-medium ${settings.pdf.imageFit === 'contain' ? 'bg-light-card dark:bg-dark-card shadow-sm' : ''}`}>{t('settings_panel.pdf_fit_contain')}</button>
                                    <button onClick={() => handlePdfSettingChange('imageFit', 'stretch')} className={`flex-1 py-1 rounded-md text-sm font-medium ${settings.pdf.imageFit === 'stretch' ? 'bg-light-card dark:bg-dark-card shadow-sm' : ''}`}>{t('settings_panel.pdf_fit_stretch')}</button>
                                </div>
                            </div>
                        </div>
                    )}
                </CollapsibleSection>
                
                <CollapsibleSection title={t('action_bar.section_resize')}>
                    <div className="flex items-center gap-2">
                         <Checkbox
                            id="resize-enabled"
                            checked={settings.resize}
                            onChange={(e) => handleSettingChange('resize', e.target.checked)}
                            disabled={isProcessing}
                         />
                         <label htmlFor="resize-enabled" className="font-medium">{t('action_bar.resize_image')}</label>
                    </div>
                     {settings.resize && (
                        <div className="space-y-4">
                            <div className="flex bg-light-accent dark:bg-dark-bg p-1 rounded-lg">
                                <button onClick={() => handleSettingChange('resizeMode', 'pixels')} className={`flex-1 py-1 rounded-md text-sm font-medium ${settings.resizeMode === 'pixels' ? 'bg-light-card dark:bg-dark-card shadow-sm' : ''}`}>{t('action_bar.pixels')}</button>
                                <button onClick={() => handleSettingChange('resizeMode', 'percentage')} className={`flex-1 py-1 rounded-md text-sm font-medium ${settings.resizeMode === 'percentage' ? 'bg-light-card dark:bg-dark-card shadow-sm' : ''}`}>{t('action_bar.percentage')}</button>
                            </div>

                            {settings.resizeMode === 'pixels' ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <input type="number" value={settings.resizeWidth ?? ''} onChange={e => handleSettingsNumberChange('resizeWidth', e.target.value)} placeholder={t('action_bar.width')} className={`${commonInputClass} text-center`} disabled={isProcessing} />
                                  <span className="text-dark-gray dark:text-light-gray">×</span>
                                  <input type="number" value={settings.resizeHeight ?? ''} onChange={e => handleSettingsNumberChange('resizeHeight', e.target.value)} placeholder={t('action_bar.height')} className={`${commonInputClass} text-center`} disabled={isProcessing} />
                                </div>
                                 <div className="flex items-center justify-between gap-2">
                                    <FitModeButton label={t('action_bar.fit_mode_contain')} isActive={settings.resizeFit === 'contain'} onClick={() => handleSettingChange('resizeFit', 'contain')} disabled={isProcessing}><ContainIcon className="w-5 h-5"/></FitModeButton>
                                    <FitModeButton label={t('action_bar.fit_mode_cover')} isActive={settings.resizeFit === 'cover'} onClick={() => handleSettingChange('resizeFit', 'cover')} disabled={isProcessing}><CoverIcon className="w-5 h-5"/></FitModeButton>
                                    <FitModeButton label={t('action_bar.fit_mode_fill')} isActive={settings.resizeFit === 'fill'} onClick={() => handleSettingChange('resizeFit', 'fill')} disabled={isProcessing}><FillIcon className="w-5 h-5"/></FitModeButton>
                                    <FitModeButton label={t('action_bar.fit_mode_smart_fill')} isActive={settings.resizeFit === 'smart-fill'} onClick={() => handleSettingChange('resizeFit', 'smart-fill')} disabled={isProcessing}><SmartFillIcon className="w-5 h-5"/></FitModeButton>
                                </div>
                              </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <input type="range" min="1" max="200" value={settings.resizeWidth ?? 100} onChange={e => handleSettingsNumberChange('resizeWidth', e.target.value)} className="w-full h-2 bg-light-accent dark:bg-border-gray rounded-lg appearance-none cursor-pointer range-thumb" disabled={isProcessing} />
                                    <input type="number" value={settings.resizeWidth ?? ''} onChange={e => handleSettingsNumberChange('resizeWidth', e.target.value)} className={`${commonInputClass} !w-20 text-center`} disabled={isProcessing} />
                                    <span className="font-medium text-dark-gray dark:text-light-gray">%</span>
                                </div>
                            )}
                        </div>
                     )}
                </CollapsibleSection>
                
                 <CollapsibleSection title={t('action_bar.section_rotate')}>
                    <Button onClick={handleRotate} disabled={isProcessing} variant="secondary" className="w-full">
                        <RotateIcon className="w-5 h-5 mr-2" />
                        {t('action_bar.rotate')} ({settings.rotation}°)
                    </Button>
                </CollapsibleSection>

                <CollapsibleSection title={t('action_bar.section_watermark')}>
                     <div className="flex items-center gap-2">
                         <Checkbox
                            id="watermark-enabled"
                            checked={settings.watermark.enabled}
                            onChange={(e) => handleWatermarkChange('enabled', e.target.checked)}
                            disabled={isProcessing}
                         />
                         <label htmlFor="watermark-enabled" className="font-medium">{t('action_bar.watermark_enable')}</label>
                     </div>
                     
                     {settings.watermark.enabled && (
                        <div className="space-y-4">
                            <div className="flex bg-light-accent dark:bg-dark-bg p-1 rounded-lg">
                                <button onClick={() => handleWatermarkChange('type', 'text')} className={`flex-1 py-1 rounded-md text-sm font-medium ${settings.watermark.type === 'text' ? 'bg-light-card dark:bg-dark-card shadow-sm' : ''}`}>{t('action_bar.watermark_text')}</button>
                                <button onClick={() => handleWatermarkChange('type', 'image')} className={`flex-1 py-1 rounded-md text-sm font-medium ${settings.watermark.type === 'image' ? 'bg-light-card dark:bg-dark-card shadow-sm' : ''}`}>{t('action_bar.watermark_image')}</button>
                            </div>

                            {settings.watermark.type === 'text' ? (
                                <input type="text" value={settings.watermark.text} onChange={e => handleWatermarkChange('text', e.target.value)} className={commonInputClass} />
                            ) : (
                                <div>
                                    <input type="file" accept="image/png, image/jpeg" ref={watermarkImageInputRef} onChange={handleWatermarkImageUpload} className="hidden" />
                                    <button onClick={() => watermarkImageInputRef.current?.click()} className={`${commonInputClass} !text-center`}>
                                        {settings.watermark.imageFile ? settings.watermark.imageFile.name : t('action_bar.upload_image')}
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={commonLabelClass}>{t('action_bar.watermark_size_perc')} ({settings.watermark.size}%)</label>
                                    <input type="range" min="1" max="50" value={settings.watermark.size} onChange={e => handleWatermarkChange('size', parseInt(e.target.value))} className="w-full h-2 bg-light-accent dark:bg-border-gray rounded-lg appearance-none cursor-pointer range-thumb mt-2" />
                                </div>
                                <div>
                                    <label className={commonLabelClass}>{t('action_bar.watermark_opacity')} ({settings.watermark.opacity})</label>
                                    <input type="range" min="0" max="1" step="0.05" value={settings.watermark.opacity} onChange={e => handleWatermarkChange('opacity', parseFloat(e.target.value))} className="w-full h-2 bg-light-accent dark:bg-border-gray rounded-lg appearance-none cursor-pointer range-thumb mt-2" />
                                </div>
                            </div>
                             {settings.watermark.type === 'text' && (
                               <div>
                                  <label className={commonLabelClass}>Color</label>
                                  <input type="color" value={settings.watermark.color} onChange={e => handleWatermarkChange('color', e.target.value)} className={`${commonInputClass} !p-1 h-10 w-full`} />
                               </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Checkbox id="mosaic-enabled" checked={settings.watermark.mosaic} onChange={(e) => handleWatermarkChange('mosaic', e.target.checked)} disabled={isProcessing} />
                                <label htmlFor="mosaic-enabled" className="font-medium">{t('action_bar.mosaic')}</label>
                            </div>

                             {settings.watermark.mosaic ? (
                                <div>
                                    <label className={commonLabelClass}>{t('action_bar.angle')} ({settings.watermark.angle}°)</label>
                                    <input type="range" min="-90" max="90" value={settings.watermark.angle} onChange={e => handleWatermarkNumberChange('angle', e.target.value)} className="w-full h-2 bg-light-accent dark:bg-border-gray rounded-lg appearance-none cursor-pointer range-thumb mt-2" />
                                </div>
                             ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className={commonLabelClass}>{t('action_bar.watermark_position')}</label>
                                        <PositionPicker current={settings.watermark.position} onChange={pos => handleWatermarkChange('position', pos)} disabled={isProcessing} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className={commonLabelClass}>{t('action_bar.joystick_title')}</label>
                                        <Joystick
                                            offsetX={settings.watermark.offsetX}
                                            offsetY={settings.watermark.offsetY}
                                            onChange={({ x, y }) => {
                                                handleWatermarkChange('offsetX', x);
                                                handleWatermarkChange('offsetY', y);
                                            }}
                                            disabled={isProcessing}
                                        />
                                    </div>
                                </div>
                             )}
                        </div>
                     )}
                </CollapsibleSection>
            </div>

            <footer className="p-4 border-t border-light-border dark:border-border-gray">
                <Button onClick={onApplyEdits} disabled={isProcessing || selectedCount === 0} className="w-full !h-12 !text-base">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    {applyButtonText}
                </Button>
            </footer>
        </aside>
    );
};