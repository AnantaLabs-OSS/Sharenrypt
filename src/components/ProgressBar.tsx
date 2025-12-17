
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
  return (
    <div className="mt-2">
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className={`${color} h-full rounded-full`}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-muted-foreground">{status}</p>
        <p className="text-xs font-medium text-foreground">{progress.toFixed(1)}%</p>
      </div>
    </div>
  );
};