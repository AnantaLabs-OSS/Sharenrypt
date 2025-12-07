
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { HistoryService, HistoryItem } from '../services/historyService';
import { formatBytes } from '../utils/formatters';

interface HistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HistoryDialog: React.FC<HistoryDialogProps> = ({ isOpen, onClose }) => {
    const [items, setItems] = useState<HistoryItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            setItems(HistoryService.getAll());
        }
    }, [isOpen]);

    const handleClear = () => {
        HistoryService.clear();
        setItems([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Transfer History
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-muted/20 p-3 rounded-lg border border-border flex items-center justify-between hover:border-primary/20 transition-colors"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-2 rounded-full ${item.direction === 'outgoing' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {item.direction === 'outgoing' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-foreground truncate pr-4" title={item.fileName}>
                                            {item.fileName}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                                            <span>{formatBytes(item.fileSize)}</span>
                                            <span>•</span>
                                            <span>{new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </p>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                            <span className="font-mono text-primary/80">{item.peerId ? item.peerId.substring(0, 8) : 'Unknown'}</span>
                                            {item.username && <span className="text-muted-foreground">• {item.username}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full border ${item.status === 'completed'
                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                                    : item.status === 'failed'
                                        ? 'border-rose-500/20 bg-rose-500/10 text-rose-500'
                                        : 'border-muted bg-muted/50 text-muted-foreground'
                                    }`}>
                                    {item.status}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No transfer history yet</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
                    {items.length > 0 && (
                        <button
                            onClick={handleClear}
                            className="text-destructive text-sm hover:text-destructive/80 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear History
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
