import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  remainingTime: number;
  className?: string;
}

export const CountdownTimer = ({ remainingTime, className = '' }: CountdownTimerProps) => {
  const { hours, minutes, seconds, progress } = useMemo(() => {
    const h = Math.floor(remainingTime / 3600);
    const m = Math.floor((remainingTime % 3600) / 60);
    const s = remainingTime % 60;
    
    // Progress for ring (assuming max 24 hours)
    const maxTime = 24 * 3600;
    const p = Math.min(100, (remainingTime / maxTime) * 100);
    
    return { hours: h, minutes: m, seconds: s, progress: p };
  }, [remainingTime]);

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isUrgent = remainingTime <= 60;
  const isWarning = remainingTime <= 300 && remainingTime > 60;

  return (
    <div className={`relative ${className}`}>
      {/* Animated Progress Ring */}
      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={isUrgent ? 'hsl(var(--destructive))' : isWarning ? 'hsl(43, 74%, 60%)' : 'hsl(var(--primary))'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={isUrgent ? 'animate-pulse' : ''}
        />
      </svg>

      {/* Timer Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={remainingTime}
          initial={{ scale: 1.05, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-4xl font-bold font-mono tracking-wider ${
            isUrgent ? 'text-destructive' : isWarning ? 'text-primary' : 'text-foreground'
          }`}
        >
          {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
        </motion.div>
        <p className="text-sm text-muted-foreground mt-1">Time Remaining</p>
      </div>
    </div>
  );
};
