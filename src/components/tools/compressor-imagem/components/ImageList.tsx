import React, { useState, useRef, useEffect } from 'react';
import type { ImageFile, Settings } from '../types';
import { ImagePreviewCard } from './ImagePreviewCard';
import { AddMoreFiles } from './AddMoreFiles';
import { Checkbox } from './Checkbox';
import { useI18n } from '../i18n';
import { Button } from './Button';
import { TrashIcon, DownloadIcon, RenameIcon } from './icons';

interface ImageListProps {
  files: ImageFile[];
  selectedFileIds: Set<string>;
  settings: Settings;
  onSelectionChange: (id: string) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  onFilesAdded: (files: File[]) => void;
  onDeleteSelected: () => void;
  onDeleteSingleFile: (id: string) => void;
  onDownload: (files: ImageFile[], format: 'zip' | 'pdf' | 'individual') => void;
  isProcessing: boolean;
  onOpenRenameModal: () => void;
}

const DownloadButton: React.FC<{
  onDownload: (format: 'zip' | 'pdf' | 'individual') => void;
  disabled: boolean;
  count: number;
}> = ({ onDownload, disabled, count }) => {
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <Button onClick={() => setIsOpen(!isOpen)} disabled={disabled} variant="secondary">
                <DownloadIcon className="w-4 h-4 mr-2" />
                {t('action_bar.download_selected')} ({count})
            </Button>
            {isOpen && (
                 <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-light-card dark:bg-dark-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                        <button onClick={() => { onDownload('individual'); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-dark-text dark:text-light-text hover:bg-light-accent dark:hover:bg-border-gray">
                            {t('action_bar.download_individual')}
                        </button>
                        <button onClick={() => { onDownload('zip'); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-dark-text dark:text-light-text hover:bg-light-accent dark:hover:bg-border-gray">
                           {t('action_bar.download_zip')}
                        </button>
                        <button onClick={() => { onDownload('pdf'); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-dark-text dark:text-light-text hover:bg-light-accent dark:hover:bg-border-gray">
                            {t('action_bar.create_pdf_selected.other', { count })}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export const ImageList: React.FC<ImageListProps> = ({ files, selectedFileIds, settings, onSelectionChange, onSelectAll, allSelected, onFilesAdded, onDeleteSelected, onDeleteSingleFile, onDownload, isProcessing, onOpenRenameModal }) => {
  const { t } = useI18n();
  const selectedCount = selectedFileIds.size;
  const processedSelectedFiles = files.filter(f => selectedFileIds.has(f.id) && f.status === 'done');

  return (
    <div className="flex flex-col h-full">
        <header className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-4">
                <label htmlFor="select-all" className={`flex items-center text-sm font-medium ${isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    <Checkbox id="select-all" checked={allSelected} onChange={onSelectAll} disabled={isProcessing} />
                    <span className="ml-2">{t('image_list.select_all')} ({selectedCount}/{files.length})</span>
                </label>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => document.getElementById('add-more-files-input-main')?.click()}>
                    {t('image_list.add_more')}
                </Button>
                 <DownloadButton 
                    onDownload={(format) => onDownload(processedSelectedFiles, format)}
                    disabled={isProcessing || processedSelectedFiles.length === 0}
                    count={processedSelectedFiles.length}
                />
                 <Button variant="secondary" onClick={onOpenRenameModal} disabled={isProcessing || selectedCount === 0}>
                    <RenameIcon className="w-4 h-4 mr-2" />
                    {t('action_bar.rename_selected')}
                </Button>
                <Button variant="secondary" onClick={onDeleteSelected} disabled={isProcessing || selectedCount === 0} className="hover:!bg-danger/10 hover:!text-danger">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    {t('action_bar.delete_selected')}
                </Button>
            </div>
        </header>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              <AddMoreFiles onFilesAdded={onFilesAdded} disabled={isProcessing} id="add-more-files-input-main" />
              {files.map(file => (
                <ImagePreviewCard 
                    key={file.id} 
                    imageFile={file}
                    isSelected={selectedFileIds.has(file.id)}
                    settings={settings}
                    onSelectionChange={() => onSelectionChange(file.id)}
                    onDelete={() => onDeleteSingleFile(file.id)}
                    onDownload={(format) => onDownload([file], format)}
                    isProcessing={isProcessing}
                />
              ))}
            </div>
        </div>
    </div>
  );
};