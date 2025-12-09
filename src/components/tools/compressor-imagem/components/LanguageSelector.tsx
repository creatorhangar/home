
import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';
import { availableLanguages } from '../locales';
import { GlobeIcon } from './icons';

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (langCode: string) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

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

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-light-accent dark:bg-dark-bg hover:bg-light-border dark:hover:bg-border-gray transition-colors"
                aria-label="Change language"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <GlobeIcon className="w-6 h-6 text-dark-text dark:text-white" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-border-gray rounded-lg shadow-xl z-30">
                    <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {Object.entries(availableLanguages).map(([code, name]) => (
                            <li key={code}>
                                <button
                                    onClick={() => handleLanguageChange(code)}
                                    className={`w-full text-left px-4 py-2 text-sm text-dark-text dark:text-light-text hover:bg-light-accent dark:hover:bg-border-gray ${language === code ? 'font-bold' : ''}`}
                                    role="menuitem"
                                >
                                    {name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};