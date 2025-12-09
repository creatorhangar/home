import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';
import { ACCEPTED_INPUT_FORMATS_WITH_HEIC, ACCEPTED_INPUT_FORMATS_STRING } from '../constants';
import { useI18n } from '../i18n';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useI18n();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [onFilesAdded]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors duration-300 ${isDragging ? 'border-primary-action bg-primary-action/10' : 'border-light-border dark:border-border-gray bg-transparent'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="bg-light-card dark:bg-white/10 p-4 rounded-full">
            <UploadIcon className="w-16 h-16 text-primary-action" />
        </div>
        <p className="text-2xl font-medium text-dark-text dark:text-light-text">
          {t('file_upload.drag_and_drop')}
        </p>
        <p className="text-dark-text dark:text-light-gray">{t('file_upload.or_paste')}</p>
        <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white transition duration-200 rounded-lg shadow-md bg-primary-action hover:bg-opacity-90 focus:shadow-outline focus:outline-none">
          {t('file_upload.browse_files')}
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept={ACCEPTED_INPUT_FORMATS_WITH_HEIC.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-sm text-dark-gray dark:text-light-gray/80 pt-4">
          {t('file_upload.supports', { formats: ACCEPTED_INPUT_FORMATS_STRING })}
        </p>
      </div>
    </div>
  );
};