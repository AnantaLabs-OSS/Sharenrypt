

import React from 'react';
import { FileTransfer } from '../types';
import { File, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { formatBytes, formatDuration } from '../utils/formatters';

interface FileListProps {
  files: FileTransfer[];
}

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

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-4 rounded-xl group hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
                <File className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-slate-200 truncate pr-4">{file.name}</h3>
                  {getStatusIcon(file.status)}
                </div>

                <p className="text-xs text-slate-400 mb-2">{formatBytes(file.size)}</p>

                {['transferring', 'downloading', 'encrypting', 'sending'].includes(file.status) ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-cyan-300 font-mono">
                      <span>{file.progress}%</span>
                      <span>
                        {file.speed ? `${formatBytes(file.speed)}/s` : ''}
                        {file.eta ? ` • ETA: ${formatDuration(file.eta)}` : ''}
                      </span>
                    </div>
                    <ProgressBar
                      progress={file.progress}
                      status={file.status === 'encrypting' ? 'Encrypting...' : file.status === 'sending' ? 'Sending...' : ''}
                      color="bg-cyan-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-full border ${file.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                      file.status === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                        file.status === 'waiting' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                          'bg-slate-700/50 border-slate-600 text-slate-400'
                      }`}>
                      {file.status === 'waiting' ? 'Finalizing...' : file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};