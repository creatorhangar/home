import React from 'react';
import { useI18n } from '../i18n';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  // Helper to render FAQ answers that may contain links
  const renderFaqAnswer = (answer: any) => {
    if (typeof answer === 'string') {
      return <p className="mt-2 text-sm text-dark-gray dark:text-light-gray">{answer}</p>;
    }
    if (Array.isArray(answer)) {
      return (
        <p className="mt-2 text-sm text-dark-gray dark:text-light-gray">
          {answer.map((part, index) => {
            if (typeof part === 'string') {
              return <span key={index}>{part}</span>;
            }
            if (part.href) {
              return (
                <a
                  key={index}
                  href={part.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary-action hover:opacity-80"
                >
                  {part.text}
                </a>
              );
            }
            return null;
          })}
        </p>
      );
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="bg-light-card dark:bg-dark-card w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-light-border dark:border-border-gray flex-shrink-0">
          <h2 id="info-modal-title" className="text-lg font-display font-bold text-dark-text dark:text-white">
            {t('info_modal.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-dark-gray hover:text-dark-text dark:hover:text-white transition-colors"
            aria-label={t('image_card.lightbox_close')}
          >
            &times;
          </button>
        </header>
        <main className="p-6 overflow-y-auto space-y-6">
          <section>
            <h3 className="text-xl font-bold font-display text-dark-text dark:text-white mb-3">
              {t('info_modal.how_to_title')}
            </h3>
            <ol className="list-decimal list-inside space-y-3">
              {t('info_modal.how_to_steps').map((step: { title: string, content: string }, index: number) => (
                <li key={index} className="text-dark-gray dark:text-light-gray">
                  <span className="font-semibold text-dark-text dark:text-light-text">{step.title}:</span> {step.content}
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-bold font-display text-dark-text dark:text-white mb-4">
              {t('info_modal.faq_title')}
            </h3>
            <div className="space-y-4">
              {t('info_modal.faq_items').map((item: { q: string, a: any }, index: number) => (
                <div key={index}>
                  <p className="font-semibold text-dark-text dark:text-light-text">{item.q}</p>
                  {renderFaqAnswer(item.a)}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};