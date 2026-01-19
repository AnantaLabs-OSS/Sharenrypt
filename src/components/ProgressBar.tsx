
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  status: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  color = 'bg-primary'
}) => {
  const safeProgress = (Number.isFinite(progress) && progress >= 0 && progress <= 100) ? progress : 0;

  return (
    <div className="mt-2">
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.3 }}
          className={`${color} h-full rounded-full`}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-muted-foreground">{status}</p>
        <p className="text-xs font-medium text-foreground">{safeProgress.toFixed(1)}%</p>
      </div>
    </div>
  );
};