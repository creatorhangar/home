import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { Button } from './Button';
import { RenameIcon } from './icons';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (pattern: string, start: number) => void;
  selectedCount: number;
}

export const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, onRename, selectedCount }) => {
  const { t } = useI18n();
  const [pattern, setPattern] = useState('{num}-file');
  const [startNumber, setStartNumber] = useState(1);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (isOpen) {
        setPreview(pattern.replace(/\{num\}/g, String(startNumber)) + '.jpg');
    }
  }, [pattern, startNumber, isOpen]);

  const handleRename = () => {
    onRename(pattern, startNumber);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-modal-title"
    >
      <div
        className="bg-light-card dark:bg-dark-card w-full max-w-md rounded-xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-light-border dark:border-border-gray">
          <h2 id="rename-modal-title" className="text-lg font-display font-bold text-dark-text dark:text-white">
            {t('rename_modal.title')} ({selectedCount})
          </h2>
        </header>
        <main className="p-6 space-y-4">
          <div>
            <label htmlFor="text-pattern" className="text-sm font-medium text-dark-gray dark:text-light-gray">
              {t('rename_modal.text_pattern')}
            </label>
            <input
              id="text-pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder={t('rename_modal.text_pattern_placeholder')}
              className="mt-1 h-10 w-full text-dark-text dark:text-light-text bg-light-accent dark:bg-dark-bg border border-light-border dark:border-border-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-action text-sm px-3"
            />
             <p className="text-xs text-dark-gray dark:text-light-gray mt-1">Use <code>{'{num}'}</code> for the number sequence.</p>
          </div>
          <div>
            <label htmlFor="start-number" className="text-sm font-medium text-dark-gray dark:text-light-gray">
              {t('rename_modal.start_number')}
            </label>
            <input
              id="start-number"
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(parseInt(e.target.value, 10) || 1)}
              min="0"
              className="mt-1 h-10 w-24 text-center text-dark-text dark:text-light-text bg-light-accent dark:bg-dark-bg border border-light-border dark:border-border-gray rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-action text-sm px-3"
            />
          </div>
           <div className="bg-light-accent dark:bg-dark-bg/50 p-3 rounded-lg border border-light-border dark:border-border-gray">
              <p className="text-sm font-medium text-dark-gray dark:text-light-gray">{t('rename_modal.preview')}</p>
              <p className="text-dark-text dark:text-white font-mono break-all">{preview}</p>
            </div>
        </main>
        <footer className="flex justify-end gap-3 p-4 border-t border-light-border dark:border-border-gray">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRename}>
            <RenameIcon className="w-4 h-4 mr-2" />
            {t('rename_modal.apply_rename')}
          </Button>
        </footer>
      </div>
    </div>
  );
};
