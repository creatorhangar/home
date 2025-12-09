

import React, { useCallback, useState } from 'react';
import { PlusIcon } from './icons';
import { ACCEPTED_INPUT_FORMATS_WITH_HEIC } from '../constants';
import { useI18n } from '../i18n';

interface AddMoreFilesProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  id?: string;
}

export const AddMoreFiles: React.FC<AddMoreFilesProps> = ({ onFilesAdded, disabled, id = "add-more-files-input" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useI18n();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(false);
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [onFilesAdded, disabled]);

  const handleClick = () => {
    if (!disabled) {
        inputRef.current?.click();
    }
  }

  return (
    <div
      className={`relative flex items-center justify-center aspect-square border-2 border-dashed rounded-xl p-4 text-center transition-colors duration-300 ${isDragging ? 'border-primary-action bg-light-card dark:bg-dark-card' : 'border-light-border dark:border-border-gray'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-action'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center space-y-2 text-dark-gray dark:text-light-gray">
        <PlusIcon className="w-8 h-8" />
        <p className="font-medium text-sm">{t('image_list.add_more')}</p>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        accept={ACCEPTED_INPUT_FORMATS_WITH_HEIC.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};