import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { number: 1, title: 'Verify & Approve' },
  { number: 2, title: 'Create Vault' },
  { number: 3, title: 'Create Auction' },
];

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle */}
            <motion.div
              className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300',
                isCompleted && 'bg-primary border-primary',
                isActive && 'border-primary bg-primary/20',
                !isCompleted && !isActive && 'border-muted-foreground/30 bg-muted/20'
              )}
              initial={false}
              animate={{
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {isCompleted ? (
                <Check className="w-5 h-5 text-primary-foreground" />
              ) : (
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.number}
                </span>
              )}

              {/* Glow effect for active step */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>

            {/* Step title */}
            <span
              className={cn(
                'ml-2 text-sm font-medium hidden sm:block',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {step.title}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 sm:w-12 h-0.5 mx-3',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
