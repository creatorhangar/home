import { motion } from 'framer-motion';
import type { BatchProgress } from '../types';

interface ProgressBarProps {
  progress: BatchProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const steps = [
    { label: 'Preparando', percent: 0 },
    { label: 'Processando Imagens', percent: 25 },
    { label: 'Gerando Capas', percent: 50 },
    { label: 'Finalizando', percent: 90 },
    { label: 'Concluído', percent: 100 },
  ];

  const currentStep = steps.findIndex(step => progress.percentage >= step.percent && progress.percentage < (steps[steps.findIndex(s => s === step) + 1]?.percent || 101));

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">
            {progress.current}
          </span>
          <span className="text-primary font-bold text-lg">
            {Math.round(progress.percentage)}%
          </span>
        </div>

        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <div className="text-sm text-white/60 text-center">
          {progress.completed} de {progress.total} concluídos
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-col items-center flex-1">
            {/* Step Circle */}
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${index <= currentStep
                ? 'bg-primary text-white glow-primary'
                : 'bg-white/10 text-white/40'
                }`}
              animate={{
                scale: index === currentStep ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: index === currentStep ? Infinity : 0,
              }}
            >
              {index < currentStep ? (
                <span className="text-lg">✓</span>
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </motion.div>

            {/* Step Label */}
            <span className={`text-xs text-center ${index <= currentStep ? 'text-white font-medium' : 'text-white/40'
              }`}>
              {step.label}
            </span>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="absolute h-0.5 bg-white/10 top-5 left-1/2 w-full -z-10">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: index < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Animated Spinner (quando processando) */}
      {progress.percentage < 100 && (
        <div className="flex justify-center">
          <motion.div
            className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
}
