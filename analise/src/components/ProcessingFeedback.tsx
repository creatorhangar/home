import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle, Cpu, Image, Sparkles } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface ProcessingFeedbackProps {
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  currentStep?: string;
  error?: string;
  fileName: string;
  scale: number;
  algorithm: string;
}

export function ProcessingFeedback({ 
  progress, 
  status, 
  error,
  fileName,
  scale,
  algorithm
}: ProcessingFeedbackProps) {
  
  const getSteps = (): ProcessingStep[] => {
    const baseSteps = [
      {
        id: 'loading',
        label: 'Loading Image',
        description: `Decoding ${fileName} and validating format`,
        icon: <Image className="w-4 h-4" />,
        completed: progress > 15,
        active: progress <= 15
      },
      {
        id: 'analyzing',
        label: 'Analyzing Structure',
        description: `Detecting edges and texture patterns for ${algorithm} algorithm`,
        icon: <Cpu className="w-4 h-4" />,
        completed: progress > 30,
        active: progress > 15 && progress <= 30
      }
    ];

    if (scale >= 3) {
      baseSteps.push({
        id: 'tiling',
        label: 'Multi-Stage Processing',
        description: `Breaking ${scale}x upscale into 2x steps to preserve quality`,
        icon: <Sparkles className="w-4 h-4" />,
        completed: progress > 60,
        active: progress > 30 && progress <= 60
      });
    }

    baseSteps.push(
      {
        id: 'upscaling',
        label: scale >= 3 ? 'Stage Processing' : 'Upscaling',
        description: scale >= 3 
          ? `Applying ${algorithm} enhancement in progressive stages`
          : `Applying ${algorithm} ${scale}x upscaling with texture reconstruction`,
        icon: <Sparkles className="w-4 h-4" />,
        completed: progress > 85,
        active: progress > (scale >= 3 ? 60 : 30) && progress <= 85
      },
      {
        id: 'finalizing',
        label: 'Finalizing Output',
        description: 'Encoding enhanced image and preparing download',
        icon: <CheckCircle className="w-4 h-4" />,
        completed: progress >= 100,
        active: progress > 85 && progress < 100
      }
    );

    return baseSteps;
  };

  const steps = getSteps();
  const activeStep = steps.find(step => step.active);

  if (status === 'pending' && progress === 0) return null;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {status === 'completed' ? 'Processing Complete' : 
             status === 'error' ? 'Processing Failed' : 
             activeStep?.label || 'Processing...'}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress 
          value={progress} 
          className={`h-2 ${status === 'error' ? 'bg-destructive/20' : ''}`}
        />
      </div>

      {/* Current Step Description */}
      {status === 'processing' && activeStep && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex-shrink-0">
            {status === 'processing' ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              activeStep.icon
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary">
              {activeStep.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeStep.description}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && error && (
        <div className="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">
              Processing Failed
            </p>
            <p className="text-xs text-muted-foreground">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === 'completed' && (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-800">
              Enhancement Complete
            </p>
            <p className="text-xs text-green-600">
              {fileName} enhanced using {algorithm} {scale}x algorithm
            </p>
          </div>
        </div>
      )}

      {/* Steps Overview (when processing) */}
      {status === 'processing' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Processing Pipeline
          </p>
          <div className="space-y-1">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 text-xs ${
                  step.completed ? 'text-green-600' : 
                  step.active ? 'text-primary' : 
                  'text-muted-foreground'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${
                  step.completed ? 'bg-green-600' : 
                  step.active ? 'bg-primary animate-pulse' : 
                  'bg-muted-foreground/30'
                }`} />
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
