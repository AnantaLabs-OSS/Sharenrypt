import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Minus, Trash2, Check, CheckCheck } from 'lucide-react';

interface ChatProps {
    messages: { id: string; peerId: string; text: string; self?: boolean; time: number; status?: 'sent' | 'delivered' | 'read' }[];
    connections: { id: string; username?: string }[];
    onSendMessage: (text: string) => void;
    onMarkAsRead?: (peerId: string, messageId: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, connections, onSendMessage, onMarkAsRead, isOpen, onClose, onClear }) => {
    const [inputText, setInputText] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isMinimized]);

    // Effect to mark messages as read when chat is open
    useEffect(() => {
        if (isOpen && !isMinimized && onMarkAsRead) {
            messages.forEach(msg => {
                if (!msg.self && msg.status !== 'read') {
                    onMarkAsRead(msg.peerId, msg.id);
                }
            });
        }
    }, [messages, isOpen, isMinimized, onMarkAsRead]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (inputText.trim()) {
            onSendMessage(inputText.trim());
            setInputText('');
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed z-40 transition-all duration-300 ${isMinimized
                ? 'bottom-4 right-4 w-72 h-14'
                : 'bottom-4 right-4 w-80 sm:w-96 h-[500px]'
                }`}
        >
            <div className="glass-panel w-full h-full flex flex-col rounded-t-xl overflow-hidden shadow-2xl border border-white/10">
                {/* Header */}
                <div
                    className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between cursor-pointer"
                    onClick={() => setIsMinimized(!isMinimized)}
                >
                    <div className="flex items-center space-x-2 text-cyan-400">
                        <MessageSquare className="w-5 h-5" />
                        <h3 className="font-semibold text-slate-100">Encrypted Chat</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="p-1 hover:bg-rose-500/20 rounded text-slate-400 hover:text-rose-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {!isMinimized && (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/30">
                            {messages.length === 0 ? (
                                <div className="text-center text-slate-500 mt-10 text-sm">
                                    <p>No messages yet.</p>
                                    <p>Start a secure conversation.</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex flex-col ${msg.self ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.self
                                                ? 'bg-cyan-600/80 text-white rounded-tr-sm shadow-lg shadow-cyan-500/10'
                                                : 'bg-slate-700/50 text-slate-200 rounded-tl-sm border border-slate-600/50'
                                                }`}
                                        >
                                            {!msg.self && (
                                                <div className="text-[10px] text-cyan-400 mb-1 font-bold">
                                                    {connections.find(c => c.id === msg.peerId)?.username || msg.peerId.substring(0, 8)}
                                                </div>
                                            )}
                                            {msg.text}

                                            <div className={`flex items-center justify-end space-x-1 mt-1 ${msg.self ? 'text-cyan-100/70' : 'text-slate-400'}`}>
                                                <span className="text-[10px]">
                                                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.self && (
                                                    <span className="" title={msg.status}>
                                                        {msg.status === 'read' ? (
                                                            <CheckCheck className="w-3 h-3 text-cyan-300" />
                                                        ) : (
                                                            <Check className="w-3 h-3 text-white/50" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/5">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="glass-input flex-1 py-2 px-3 text-sm rounded-full"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </motion.div>
    );
};
