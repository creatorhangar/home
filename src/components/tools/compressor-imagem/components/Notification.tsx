import React, { useEffect, useState } from 'react';
import type { NotificationType } from '../types';
import { InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface NotificationProps {
  notification: NotificationType | null;
  onClose: () => void;
}

const notificationIcons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  warning: <InformationCircleIcon className="w-6 h-6 text-yellow-500" />,
  error: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
};

const notificationColors = {
  success: 'border-green-500/50',
  warning: 'border-yellow-500/50',
  error: 'border-red-500/50',
};

export const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  if (!notification) {
    return null;
  }

  return (
    <div
      key={notification.id}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-2 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}
      role="alert"
    >
      <div className={`bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-lg border ${notificationColors[notification.type]} rounded-xl shadow-2xl flex items-start p-4`}>
        <div className="flex-shrink-0">
            {notificationIcons[notification.type]}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-bold text-dark-text dark:text-white">{notification.title}</p>
          <p className="mt-1 text-sm text-dark-gray dark:text-light-gray">{notification.message}</p>
          {notification.details && notification.details.length > 0 && (
            <ul className="list-disc list-inside mt-2 text-xs text-dark-gray dark:text-light-gray max-h-24 overflow-y-auto">
              {notification.details.map((detail, index) => (
                <li key={index} className="truncate" title={detail}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-dark-gray dark:text-light-gray hover:text-dark-text dark:hover:text-light-text"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 M10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};