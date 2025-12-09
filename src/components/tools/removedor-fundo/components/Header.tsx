
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, languages } from '../utils/localization';
import { GlobeAltIcon } from './Icons';

const Header: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const title = t('header.title');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="py-6">
      <div className="container mx-auto px-4 relative">
        <div className="absolute top-0 right-0 z-20" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
            aria-label={t('controlPanel.language')}
          >
            <GlobeAltIcon className="w-6 h-6" />
            <span className="font-semibold uppercase">{language}</span>
          </button>
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200">
              <ul>
                {Object.entries(languages).map(([code, name]) => (
                  <li key={code}>
                    <button
                      onClick={() => {
                        setLanguage(code);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        language === code
                          ? 'font-bold text-accent-primary bg-accent-primary/10'
                          : 'text-text-primary'
                      } hover:bg-gray-100`}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-text-primary">
            {title.split('').map((char, index) => (
              <span
                key={index}
                className="letter-mask"
                style={{ '--delay': `${index * 50}ms` } as React.CSSProperties}
              >
                <span className="letter-content">
                  {char === ' ' ? '\u00A0' : char}
                </span>
              </span>
            ))}
          </h1>
          <p className="mt-3 text-base text-gray-700 max-w-md mx-auto">
            {t('header.subtitle')}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
