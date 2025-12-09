
import React from 'react';
import { useI18n } from '../i18n';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const { t } = useI18n();

  return (
    <div className="w-full md:w-56">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-dark-text dark:text-white">{t('action_bar.converting')}</span>
        <span className="text-sm font-medium text-dark-gray dark:text-light-gray">{current} / {total}</span>
      </div>
      <div className="w-full bg-light-border dark:bg-border-gray rounded-full h-2.5">
        <div 
          className="bg-primary-action h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
