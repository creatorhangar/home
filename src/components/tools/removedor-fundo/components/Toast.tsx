
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons';

type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Componente para uma única notificação de toast.
const ToastMessage: React.FC<{ toast: Toast; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  // O toast se autodestrói após 5 segundos.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300); // Espera a animação de saída terminar
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };
  
  const typeClasses = {
      success: 'bg-green-500 border-green-600',
      error: 'bg-red-500 border-red-600',
      info: 'bg-blue-500 border-blue-600',
  };
  const Icon = {
    success: <CheckCircleIcon className="w-6 h-6 mr-3" />,
    error: <XCircleIcon className="w-6 h-6 mr-3" />,
    info: null
  }

  return (
    <div
      className={`relative flex items-center text-white p-4 rounded-lg shadow-lg mb-2 transition-all duration-300 transform ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'} ${typeClasses[toast.type]}`}
      role="alert"
    >
      {Icon[toast.type]}
      <p className="flex-grow text-sm font-medium">{toast.message}</p>
      <button onClick={handleDismiss} className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Container que renderiza a lista de toasts ativos.
export const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-xs">
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
