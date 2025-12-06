import React from 'react';
import { FileTransfer } from '../types';
import { File, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';

interface FileListProps {
  files: FileTransfer[];
}

export const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

export const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
};

export const FileList: React.FC<FileListProps> = ({ files }) => {
  const getStatusIcon = (status: FileTransfer['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'transferring':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const isActive = (status: FileTransfer['status']) =>
    ['transferring', 'encrypting', 'downloading'].includes(status);

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/50 backdrop-blur-sm border border-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex-shrink-0"
              >
                <File className="w-8 h-8 text-blue-500" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                  {isActive(file.status) && file.speed !== undefined && file.speed > 0 && (
                    <span className="text-xs text-gray-500 font-mono">
                      {formatSize(file.speed)}/s • ETA: {formatTime(file.eta || 0)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{formatSize(file.size)}</p>

                {isActive(file.status) && (
                  <ProgressBar
                    progress={file.progress}
                    status={file.status.charAt(0).toUpperCase() + file.status.slice(1) + '...'}
                    color="bg-blue-500"
                  />
                )}
              </div>
              <motion.div whileHover={{ scale: 1.1 }}>
                {getStatusIcon(file.status)}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};