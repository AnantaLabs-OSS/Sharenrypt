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
  color = 'bg-blue-500'
}) => {
  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className={`${color} h-full rounded-full`}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-gray-500">{status}</p>
        <p className="text-xs font-medium">{progress.toFixed(1)}%</p>
      </div>
    </div>
  );
};