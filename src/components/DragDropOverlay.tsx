import React, { useEffect, useState } from 'react';
import { FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DragDropOverlayProps {
    onFileDrop: (files: File[]) => void;
    isConnect: boolean;
}

export const DragDropOverlay: React.FC<DragDropOverlayProps> = ({ onFileDrop, isConnect }) => {
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const handleDragEnter = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer?.types.includes('Files')) {
                setIsDragging(true);
            }
        };

        const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            // Only set false if leaving the window
            if (e.relatedTarget === null) {
                setIsDragging(false);
            }
        };

        const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = async (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (e.dataTransfer?.items) {
                const { getFilesFromDataTransfer } = await import('../utils/fileUtils');
                const files = await getFilesFromDataTransfer(e.dataTransfer.items);
                if (files.length > 0) {
                    onFileDrop(files);
                }
            } else if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                // Fallback
                const files = Array.from(e.dataTransfer.files);
                onFileDrop(files);
            }
        };

        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
        };
    }, [onFileDrop]);

    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-8 pointer-events-none"
                >
                    <div className="w-full h-full border-4 border-dashed border-cyan-500/50 rounded-3xl flex flex-col items-center justify-center bg-cyan-500/5 transition-colors">
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 p-8 rounded-full shadow-2xl shadow-cyan-500/20 mb-6"
                        >
                            <FileUp className="w-16 h-16 text-cyan-400 animate-bounce" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-slate-100 mb-2">
                            Drop file to send
                        </h2>
                        <p className="text-slate-400 text-lg">
                            {isConnect
                                ? 'Release to instantly start secure transfer'
                                : 'Connect to a peer first to start sharing'}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
