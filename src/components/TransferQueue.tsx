import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueueItem } from '../types';
import { X, Check, File, Loader, Trash2 } from 'lucide-react';
import { formatSize } from '../components/FileList';

interface TransferQueueProps {
    items: QueueItem[];
    onRemove: (id: string) => void;
    onClearCompleted: () => void;
}

export const TransferQueue: React.FC<TransferQueueProps> = ({ items, onRemove, onClearCompleted }) => {
    if (items.length === 0) return null;

    const completedCount = items.filter(i => i.status === 'completed').length;

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-[500px] flex flex-col z-50">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                        <Loader className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                        Transfer Queue
                        <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                            {items.length}
                        </span>
                    </h3>
                    {completedCount > 0 && (
                        <button
                            onClick={onClearCompleted}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                            Clear Done
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="overflow-y-auto overflow-x-hidden p-2 space-y-2 custom-scrollbar flex-1">
                    <AnimatePresence mode='popLayout'>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={`
                  relative p-3 rounded-lg border group
                  ${item.status === 'completed' ? 'bg-green-500/10 border-green-500/20' :
                                        item.status === 'failed' ? 'bg-red-500/10 border-red-500/20' :
                                            item.status === 'transferring' ? 'bg-cyan-500/10 border-cyan-500/20' :
                                                'bg-slate-800/50 border-slate-700/50'}
                `}
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                                        <File className="w-4 h-4 text-slate-400" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-medium text-sm text-slate-200 truncate pr-2" title={item.file.name}>
                                                {item.file.name}
                                            </p>
                                            {item.status !== 'transferring' && item.status !== 'queued' && (
                                                <button
                                                    onClick={() => onRemove(item.id)}
                                                    className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                                            <span>{formatSize(item.file.size)}</span>
                                            <span className="capitalize" style={{
                                                color: item.status === 'transferring' ? '#22d3ee' :
                                                    item.status === 'completed' ? '#4ade80' :
                                                        item.status === 'failed' ? '#f87171' : ''
                                            }}>
                                                {item.status}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1 w-full bg-slate-700/50 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full ${item.status === 'completed' ? 'bg-green-500' :
                                                        item.status === 'failed' ? 'bg-red-500' :
                                                            'bg-cyan-500'
                                                    }`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
