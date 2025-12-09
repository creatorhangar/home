import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';
import { DownloadIcon, CheckCircleIcon } from './icons';

interface DownloadAllButtonProps {
    onDownloadAsZip: () => void;
    onDownloadAsPdf: () => void;
    downloadableCount: number;
    disabled: boolean;
    feedbackActive: boolean;
}

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);


export const DownloadAllButton: React.FC<DownloadAllButtonProps> = ({
    onDownloadAsZip,
    onDownloadAsPdf,
    downloadableCount,
    disabled,
    feedbackActive
}) => {
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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const Icon = feedbackActive ? CheckCircleIcon : DownloadIcon;
    const iconColor = feedbackActive ? 'text-green-500' : '';

    return (
        <div className="relative inline-flex rounded-lg shadow-sm" ref={wrapperRef}>
            <button
                type="button"
                className="inline-flex items-center justify-center h-10 px-3 sm:px-4 text-sm font-medium text-dark-text dark:text-white bg-light-accent dark:bg-border-gray border border-r-0 border-light-border dark:border-border-gray rounded-l-lg hover:bg-light-border dark:hover:bg-dark-bg focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-action disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={onDownloadAsZip}
                disabled={disabled}
            >
                <Icon className={`w-4 h-4 mr-2 ${iconColor}`} />
                <span>{feedbackActive ? t('action_bar.starting') : t('action_bar.download_all_zip')}</span>
                {downloadableCount > 0 && !feedbackActive && (
                    <span className="ml-2 bg-light-border text-dark-text dark:bg-border-gray dark:text-light-text text-xs font-bold px-2 py-0.5 rounded-full">{downloadableCount}</span>
                )}
            </button>
            <div className="relative">
                <button
                    type="button"
                    className="inline-flex items-center justify-center h-10 w-10 text-dark-text dark:text-white bg-light-accent dark:bg-border-gray border border-light-border dark:border-border-gray rounded-r-lg hover:bg-light-border dark:hover:bg-dark-bg focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-action disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
                {isOpen && (
                    <div className="absolute right-0 z-10 bottom-full mb-2 w-56 rounded-md shadow-lg bg-light-card dark:bg-dark-card ring-1 ring-black dark:ring-border-gray ring-opacity-5 focus:outline-none">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                                onClick={() => { onDownloadAsPdf(); setIsOpen(false); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-dark-text dark:text-light-text hover:bg-light-accent dark:hover:bg-border-gray"
                                role="menuitem"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                <span>{t('action_bar.create_pdf_all')}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};