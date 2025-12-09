import React from 'react';
import type { AddFilesConfirmationModalProps } from '../types';
import { useI18n } from '../i18n';
import { Button } from './Button';

export const AddFilesConfirmationModal: React.FC<AddFilesConfirmationModalProps> = ({ isOpen, onClose, onReplace, onAppend }) => {
    const { t } = useI18n();

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="confirmation-modal-title"
        >
            <div 
                className="bg-light-card dark:bg-dark-card w-full max-w-md rounded-xl shadow-2xl flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-light-border dark:border-border-gray">
                    <h2 id="confirmation-modal-title" className="text-lg font-display font-bold text-dark-text dark:text-white">
                        {t('add_files_confirmation.title')}
                    </h2>
                </header>
                <main className="p-6">
                    <p className="text-dark-text dark:text-light-text">{t('add_files_confirmation.message')}</p>
                </main>
                <footer className="flex justify-end gap-3 p-4 border-t border-light-border dark:border-border-gray">
                    <Button variant="secondary" onClick={onReplace}>{t('add_files_confirmation.replace_button')}</Button>
                    <Button onClick={onAppend}>{t('add_files_confirmation.add_button')}</Button>
                </footer>
            </div>
        </div>
    );
};
