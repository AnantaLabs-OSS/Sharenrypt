
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
    if (!status) return <Clock className="w-5 h-5 text-muted-foreground" />;

    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'pending':
      case 'transferring':
      case 'receiving':
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
            className="bg-card p-4 rounded-xl border border-border group hover:border-primary/30 transition-colors shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <File className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-foreground truncate pr-4">{file.name}</h3>
                  {getStatusIcon(file.status)}
                </div>

                <p className="text-xs text-muted-foreground mb-2">{formatBytes(file.size)}</p>

                {(file.status && ['transferring', 'downloading', 'encrypting', 'sending', 'receiving'].includes(file.status)) ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-primary font-mono">
                      <span>{file.progress?.toFixed(1) || 0}%</span>
                      <span>
                        {file.speed ? `${formatBytes(file.speed)}/s` : ''}
                        {file.eta ? ` • ETA: ${formatDuration(file.eta)}` : ''}
                      </span>
                    </div>
                    <ProgressBar
                      progress={file.progress || 0}
                      status={file.status === 'encrypting' ? 'Encrypting...' :
                        file.status === 'sending' ? 'Sending...' :
                          file.status === 'receiving' ? 'Receiving...' : ''}
                      color="bg-primary"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-0.5 rounded-full border ${file.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                      file.status === 'error' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                        file.status === 'waiting' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                          'bg-muted border-border text-muted-foreground'
                      }`}>
                      {file.status === 'waiting' ? 'Finalizing...' : (file.status ? file.status.charAt(0).toUpperCase() + file.status.slice(1) : 'Pending')}
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