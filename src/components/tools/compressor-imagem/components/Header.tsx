import React from 'react';
import { MoonIcon, SunIcon, QuestionMarkCircleIcon } from './icons';
import { useI18n } from '../i18n';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
    onOpenInfoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onOpenInfoModal }) => {
  const { t } = useI18n();
  return (
    <header className="bg-light-card dark:bg-dark-card border-b border-light-border dark:border-border-gray sticky top-0 z-20 w-full shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between min-h-20 gap-4 py-3">
        <div className="flex flex-1 items-center gap-4 min-w-0">
            <img src="/logo.png" alt={t('header.logo_alt')} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            <div className="flex flex-col justify-center min-w-0">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-dark-text dark:text-white leading-tight break-words">
                    {t('header.title')}
                </h1>
                <p className="text-sm sm:text-base text-dark-gray dark:text-light-gray break-words">
                    {t('header.subtitle')}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="hidden sm:inline-block bg-light-accent dark:bg-dark-bg/50 border border-light-border dark:border-border-gray text-xs font-medium px-3 py-1 rounded-full">
                <span className="font-bold text-dark-text dark:text-white">{t('header.offline_badge')}</span> <span className="text-dark-gray dark:text-light-gray">{t('header.offline_message')}</span>
            </div>
            <button
                onClick={onOpenInfoModal}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-light-accent dark:bg-dark-bg hover:bg-light-border dark:hover:bg-border-gray transition-colors"
                aria-label={t('header.info_button_label')}
            >
                <QuestionMarkCircleIcon className="w-6 h-6 text-dark-text dark:text-white" />
            </button>
            <div className="flex items-center gap-2">
                <LanguageSelector />
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
        </div>
      </div>
    </header>
  );
};

const ThemeToggle: React.FC<{theme: 'dark' | 'light'; onToggle: () => void}> = ({ theme, onToggle }) => {
    const { t } = useI18n();
    return (
        <button 
            onClick={onToggle}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-light-accent dark:bg-dark-bg hover:bg-light-border dark:hover:bg-border-gray transition-colors"
            aria-label={t(theme === 'dark' ? 'header.theme_toggle_light' : 'header.theme_toggle_dark')}
        >
            {theme === 'dark' ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-dark-text" />}
        </button>
    );
}