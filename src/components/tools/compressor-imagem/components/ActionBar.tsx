import React from 'react';
import type { Settings, OutputFormat, ProcessingStatus } from '../types';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { SparklesIcon, DownloadIcon, TrashIcon, CheckCircleIcon, ResizeIcon, RenameIcon, RotateIcon, InformationCircleIcon, ContainIcon, CoverIcon, FillIcon, SmartFillIcon } from './icons';
import { useI18n } from '../i18n';
import { DownloadSelectedButton } from './DownloadSelectedButton';
import { Checkbox } from './Checkbox';
import { DownloadAllButton } from './DownloadAllButton';


interface ActionBarProps {
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  onStartConversion: () => void;
  onCancelConversion: () => void;
  onDownloadAllAsZip: () => void;
  onDownloadAllAsPdf: () => void;
  onDeleteSelected: () => void;
  onDownloadSelectedIndividually: () => void;
  onDownloadSelectedAsZip: () => void;
  onDownloadSelectedAsPdf: () => void;
  onOpenRenameModal: () => void;
  processingStatus: ProcessingStatus;
  processedCount: number;
  totalCount: number;
  hasFiles: boolean;
  canDownloadAll: boolean;
  downloadableCount: number;
  canDownloadSelected: boolean;
  canDeleteSelected: boolean;
  selectedCount: number;
  downloadFeedback: 'none' | 'all' | 'selected';
  estimatedSize: number | null;
  estimatedOriginalSize: number | null;
  availableFormats: { value: OutputFormat; label: string }[];
  isAvifSupported: boolean;
}

const FitModeButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
}> = ({ label, isActive, onClick, disabled, children }) => {
    const activeClasses = 'bg-primary-action/20 text-primary-action dark:bg-primary-action/30 dark:text-white';
    const inactiveClasses = 'text-dark-text dark:text-white bg-light-accent dark:bg-border-gray hover:bg-light-border dark:hover:bg-dark-bg';
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


export const ActionBar: React.FC<ActionBarProps> = ({
  settings,
  onSettingsChange,
  onStartConversion,
  onCancelConversion,
  onDownloadAllAsZip,
  onDownloadAllAsPdf,
  onDeleteSelected,
  onDownloadSelectedIndividually,
  onDownloadSelectedAsZip,
  onDownloadSelectedAsPdf,
  onOpenRenameModal,
  processingStatus,
  processedCount,
  totalCount,
  hasFiles,
  canDownloadAll,
  downloadableCount,
  canDownloadSelected,
  canDeleteSelected,
  selectedCount,
  downloadFeedback,
  estimatedSize,
  estimatedOriginalSize,
  availableFormats,
  isAvifSupported,
}) => {
  const { t } = useI18n();

  const handleSettingsNumberChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof Settings) => {
    const value = e.target.value;
    onSettingsChange({ [key]: value === '' ? null : parseInt(value, 10) });
  };
  
  const handleRotate = () => {
    const currentRotation = settings.rotation || 0;
    const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
    const currentIndex = rotations.indexOf(currentRotation);
    const nextIndex = (currentIndex + 1) % rotations.length;
    const nextRotation = rotations[nextIndex];
    onSettingsChange({ rotation: nextRotation });
  };

  const isProcessing = processingStatus === 'processing';
  const showQualitySlider = ['jpeg', 'webp', 'avif', 'pdf'].includes(settings.outputFormat);

  const convertButtonTextKey = hasFiles ? 'action_bar.compress_button_count' : 'action_bar.compress_button';
  const convertButtonText = t(convertButtonTextKey, { count: totalCount });

  const formatBytes = (bytes: number, decimals = 1) => {
    const byteUnits: string[] = t('image_card.byte_units');
    if (bytes <= 0) return '0 ' + (byteUnits[0] || 'Bytes');
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + byteUnits[i];
  };
  
  const commonInputClasses = "h-10 w-20 text-center text-dark-text dark:text-light-text bg-light-accent dark:bg-dark-bg border border-light-border dark:border-border-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-action text-sm";

  const isPdfOutput = settings.outputFormat === 'pdf';

  // Fix: Defined `feedbackActive` to resolve reference error.
  const feedbackActive = downloadFeedback === 'selected';

  const EstimatedSizeDisplay = () => {
    if (estimatedSize === null || estimatedOriginalSize === null || selectedCount !== 1) {
        return null;
    }

    const savings = estimatedOriginalSize - estimatedSize;
    const percentage = estimatedOriginalSize > 0 ? Math.round((savings / estimatedOriginalSize) * 100) : 0;
    
    const isReduction = savings > 0;
    const percentageText = isReduction ? `~ -${percentage}%` : `~ +${Math.abs(percentage)}%`;
    const colorClass = isReduction ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500';

    return (
        <div className="text-center text-xs text-dark-gray dark:text-light-gray">
            {t('action_bar.estimated_size', { size: formatBytes(estimatedSize) })}
            <span className={`font-bold ml-2 ${colorClass}`}>{percentageText}</span>
        </div>
    );
};


  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-4" role="toolbar" aria-label="Ações principais">
      <div className="max-w-7xl mx-auto bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-lg border border-light-border dark:border-border-gray rounded-xl shadow-2xl flex flex-col transition-all">
        {isProcessing && (
          <div className="flex items-center justify-between gap-4 p-3 sm:p-4 border-b border-light-border dark:border-border-gray">
              <ProgressBar current={processedCount} total={totalCount} />
              <Button variant="secondary" onClick={onCancelConversion} className="!h-10 !px-4">{t('action_bar.cancel')}</Button>
          </div>
        )}
        <div className="p-3 sm:p-4">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
            
            {/* Settings Section */}
            <div className="flex-1 flex flex-col lg:flex-row justify-center lg:justify-start gap-x-3 sm:gap-x-4 gap-y-3 w-full">
              <div className="flex items-center gap-x-3 sm:gap-x-4 flex-shrink-0 justify-center">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="outputFormat" className="text-xs font-medium text-dark-gray dark:text-light-gray">{t('action_bar.output_format')}</label>
                    {!isAvifSupported && (
                      <div className="group relative">
                        <InformationCircleIcon className="w-4 h-4 text-dark-gray/80 dark:text-light-gray" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs text-center text-light-text bg-dark-bg rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {t('action_bar.avif_unsupported_tooltip')}
                        </div>
                      </div>
                    )}
                  </div>
                  <select
                    id="outputFormat"
                    value={settings.outputFormat}
                    onChange={(e) => onSettingsChange({ outputFormat: e.target.value as OutputFormat })}
                    disabled={isProcessing}
                    className="h-10 px-3 text-dark-text dark:text-light-text bg-light-accent dark:bg-dark-bg border border-light-border dark:border-border-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-action text-sm"
                  >
                    {availableFormats.map(option => (
                      <option className="bg-light-card dark:bg-dark-card text-dark-text dark:text-light-text" key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                {showQualitySlider && (
                  <div className="min-w-[150px] md:min-w-[180px]">
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="quality" className="text-xs font-medium text-dark-gray dark:text-light-gray">{t('action_bar.quality')}</label>
                        <span className="text-xs font-bold text-dark-text dark:text-light-text bg-light-accent dark:bg-border-gray px-2 py-0.5 rounded-md">{settings.quality}</span>
                    </div>
                    <input
                      type="range"
                      id="quality"
                      min="1"
                      max="100"
                      value={settings.quality}
                      onChange={(e) => onSettingsChange({ quality: parseInt(e.target.value, 10)})}
                      disabled={isProcessing}
                      className="w-full h-2 bg-light-accent dark:bg-border-gray rounded-lg appearance-none cursor-pointer range-thumb"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-grow flex items-center gap-x-3 sm:gap-x-4 justify-center bg-light-accent/50 dark:bg-dark-bg/50 p-2 rounded-lg border border-light-border dark:border-border-gray">
                <button onClick={handleRotate} disabled={isProcessing} title={t('action_bar.rotate')} className="flex items-center justify-center gap-2 h-10 px-3 text-sm font-medium transition duration-200 rounded-lg focus:shadow-outline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-dark-text dark:text-white bg-light-accent dark:bg-border-gray hover:bg-light-border dark:hover:bg-dark-bg">
                    <RotateIcon className="w-5 h-5" />
                    <span className="text-xs font-bold w-8">{settings.rotation || 0}°</span>
                </button>
                
                <div className="w-px h-8 bg-light-border dark:bg-border-gray"></div>
                
                <label htmlFor="resize" className={`flex items-center gap-2 flex-shrink-0 ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <ResizeIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('action_bar.resize_image')}</span>
                    <Checkbox id="resize" checked={settings.resize} onChange={(e) => onSettingsChange({ resize: e.target.checked })} disabled={isProcessing} />
                </label>

                {settings.resize && (
                  <div className="flex items-center gap-x-2 sm:gap-x-4 gap-y-2 flex-wrap justify-center">
                    <select
                      id="resizeMode"
                      value={settings.resizeMode}
                      onChange={(e) => onSettingsChange({ resizeMode: e.target.value as 'pixels' | 'percentage' })}
                      disabled={isProcessing}
                      className="h-10 px-3 text-dark-text dark:text-light-text bg-light-accent dark:bg-dark-bg border border-light-border dark:border-border-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-action text-sm"
                    >
                      <option value="pixels">{t('action_bar.pixels')}</option>
                      <option value="percentage">{t('action_bar.percentage')}</option>
                    </select>

                    {settings.resizeMode === 'pixels' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <label htmlFor="resizeWidth" className="text-xs font-medium text-dark-gray dark:text-light-gray sr-only">{t('action_bar.width')}</label>
                          <input type="number" id="resizeWidth" value={settings.resizeWidth ?? ''} onChange={e => handleSettingsNumberChange(e, 'resizeWidth')} placeholder={t('action_bar.width')} className={commonInputClasses} disabled={isProcessing} />
                          <span className="text-xs text-dark-gray dark:text-light-gray">×</span>
                          <label htmlFor="resizeHeight" className="text-xs font-medium text-dark-gray dark:text-light-gray sr-only">{t('action_bar.height')}</label>
                          <input type="number" id="resizeHeight" value={settings.resizeHeight ?? ''} onChange={e => handleSettingsNumberChange(e, 'resizeHeight')} placeholder={t('action_bar.height')} className={commonInputClasses} disabled={isProcessing} />
                        </div>
                        {(settings.resizeWidth || settings.resizeHeight) && (
                           <div className="flex items-center gap-2">
                                <FitModeButton label={t('action_bar.fit_mode_contain')} isActive={settings.resizeFit === 'contain'} onClick={() => onSettingsChange({ resizeFit: 'contain' })} disabled={isProcessing}><ContainIcon className="w-5 h-5"/></FitModeButton>
                                <FitModeButton label={t('action_bar.fit_mode_cover')} isActive={settings.resizeFit === 'cover'} onClick={() => onSettingsChange({ resizeFit: 'cover' })} disabled={isProcessing}><CoverIcon className="w-5 h-5"/></FitModeButton>
                                <FitModeButton label={t('action_bar.fit_mode_fill')} isActive={settings.resizeFit === 'fill'} onClick={() => onSettingsChange({ resizeFit: 'fill' })} disabled={isProcessing}><FillIcon className="w-5 h-5"/></FitModeButton>
                                <FitModeButton label={t('action_bar.fit_mode_smart_fill')} isActive={settings.resizeFit === 'smart-fill'} onClick={() => onSettingsChange({ resizeFit: 'smart-fill' })} disabled={isProcessing}><SmartFillIcon className="w-5 h-5"/></FitModeButton>
                           </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <label htmlFor="resizePercentage" className="text-xs font-medium text-dark-gray dark:text-light-gray sr-only">{t('action_bar.scale_percent')}</label>
                        <input type="range" id="resizePercentage" min="1" max="200" value={settings.resizeWidth ?? 100} onChange={e => handleSettingsNumberChange(e, 'resizeWidth')} className="w-24 h-2 bg-light-accent dark:bg-border-gray rounded-lg appearance-none cursor-pointer range-thumb" disabled={isProcessing} />
                        <input type="number" value={settings.resizeWidth ?? ''} onChange={e => handleSettingsNumberChange(e, 'resizeWidth')} className={`${commonInputClasses} !w-16`} disabled={isProcessing} />
                        <span className="text-sm font-medium text-dark-gray dark:text-light-gray">%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

               <div className="w-full lg:hidden"><EstimatedSizeDisplay /></div>
              
            </div>

            {/* Main Action Section */}
            <div className="flex-shrink-0 w-full xl:w-auto flex flex-col items-center justify-center">
               <div className="hidden lg:block mb-1.5 h-4"><EstimatedSizeDisplay /></div>
              <Button 
                onClick={onStartConversion} 
                disabled={!hasFiles || isProcessing} 
                className="w-full md:w-auto min-w-[220px] !h-14 !text-base"
              >
                <SparklesIcon className="w-6 h-6 mr-2" />
                {convertButtonText}
              </Button>
            </div>
            
            {/* Secondary Actions Section */}
            <div className="flex-1 flex justify-center xl:justify-end">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {isPdfOutput ? (
                  <button
                    onClick={onDownloadSelectedAsPdf}
                    disabled={!canDownloadSelected || isProcessing || downloadFeedback !== 'none'}
                    className="inline-flex items-center justify-center h-10 px-3 sm:px-4 text-sm font-medium transition duration-200 rounded-lg focus:shadow-outline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-dark-text dark:text-white bg-light-accent dark:bg-border-gray hover:bg-light-border dark:hover:bg-dark-bg"
                  >
                    {feedbackActive ? <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> : <DownloadIcon className="w-4 h-4 mr-2" />}
                    <span>{t('action_bar.create_pdf_selected', { count: selectedCount })}</span>
                  </button>
                ) : (
                  <DownloadSelectedButton
                      onDownloadIndividually={onDownloadSelectedIndividually}
                      onDownloadAsZip={onDownloadSelectedAsZip}
                      selectedCount={selectedCount}
                      disabled={!canDownloadSelected || isProcessing}
                      feedbackActive={downloadFeedback === 'selected'}
                  />
                )}
                <DownloadAllButton
                  onDownloadAsZip={onDownloadAllAsZip}
                  // Fix: Pass the correct 'onDownloadAllAsPdf' prop to the 'DownloadAllButton' component. The variable 'onDownloadAsPdf' was not defined in this scope.
                  onDownloadAsPdf={onDownloadAllAsPdf}
                  downloadableCount={downloadableCount}
                  disabled={!canDownloadAll || isProcessing || downloadFeedback !== 'none'}
                  feedbackActive={downloadFeedback === 'all'}
                />
                <button onClick={onOpenRenameModal} disabled={!canDeleteSelected || isProcessing} className="inline-flex items-center justify-center h-10 px-3 sm:px-4 text-sm font-medium transition duration-200 rounded-lg focus:shadow-outline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-dark-text dark:text-white bg-light-accent dark:bg-border-gray hover:bg-light-border dark:hover:bg-dark-bg">
                    <RenameIcon className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('action_bar.rename_selected')}</span>
                    {selectedCount > 0 && (
                        <span className="ml-0 sm:ml-2 bg-light-border text-dark-text dark:bg-border-gray dark:text-light-text text-xs font-bold px-2 py-0.5 rounded-full">{selectedCount}</span>
                    )}
                </button>
                <button onClick={onDeleteSelected} disabled={!canDeleteSelected || isProcessing} className="inline-flex items-center justify-center h-10 px-3 sm:px-4 text-sm font-medium transition duration-200 rounded-lg focus:shadow-outline focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-dark-text dark:text-white bg-light-accent dark:bg-border-gray hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400">
                    <TrashIcon className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('action_bar.delete_selected')}</span>
                    {selectedCount > 0 && (
                        <span className="ml-0 sm:ml-2 bg-red-100 text-red-700 dark:bg-red-500/30 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">{selectedCount}</span>
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};