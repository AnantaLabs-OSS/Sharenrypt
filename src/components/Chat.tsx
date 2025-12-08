
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, X, Minus, Trash2, Check, CheckCheck, ChevronDown } from 'lucide-react';

interface ChatProps {
    messages: { id: string; peerId: string; text: string; self?: boolean; time: number; status?: 'sent' | 'delivered' | 'read' }[];
    connections: { id: string; username?: string }[];
    onSendMessage: (text: string) => void;
    onMarkAsRead?: (peerId: string, messageId: string) => void;
    isOpen: boolean;
    onClose: () => void;
    onClear: () => void;
    typingStatus?: Record<string, boolean>;
    onSendTyping?: (isTyping: boolean) => void;
}

export const Chat: React.FC<ChatProps> = ({ messages, connections, onSendMessage, onMarkAsRead, isOpen, onClose, onClear, typingStatus, onSendTyping }) => {
    const [inputText, setInputText] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate unread count
    const unreadCount = messages.filter(m => !m.self && m.status !== 'read').length;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isMinimized, typingStatus]);

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
            if (onSendTyping) onSendTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (onSendTyping) {
            onSendTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                onSendTyping(false);
            }, 2000);
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
                : 'inset-0 sm:inset-auto sm:bottom-4 sm:right-4 w-full h-full sm:w-96 sm:h-[500px]'
                }`}
        >
            <div className="bg-card w-full h-full flex flex-col sm:rounded-t-xl overflow-hidden shadow-2xl border border-border">
                {/* Header */}
                <div
                    className="p-3 bg-primary/5 border-b border-border flex items-center justify-between cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setIsMinimized(!isMinimized)}
                >
                    <div className="flex items-center space-x-2 text-primary">
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground sm:hidden mr-1"
                        >
                            <ChevronDown className="w-5 h-5" />
                        </button>
                        <MessageSquare className="w-5 h-5" />
                        <h3 className="font-semibold text-foreground">Encrypted Chat</h3>
                        {isMinimized && unreadCount > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {!isMinimized && (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground mt-10 text-sm">
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
                                                ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md'
                                                : 'bg-muted text-foreground rounded-tl-sm border border-border'
                                                }`}
                                        >
                                            {!msg.self && (
                                                <div className="text-[10px] text-primary mb-1 font-bold opacity-80">
                                                    {connections.find(c => c.id === msg.peerId)?.username || msg.peerId.substring(0, 8)}
                                                </div>
                                            )}
                                            {msg.text}

                                            <div className={`flex items-center justify-end space-x-1 mt-1 ${msg.self ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                <span className="text-[10px]">
                                                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.self && (
                                                    <span className="" title={msg.status}>
                                                        {msg.status === 'read' ? (
                                                            <CheckCheck className="w-3 h-3 text-current" />
                                                        ) : (
                                                            <Check className="w-3 h-3 text-current/50" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}

                            {/* Typing Indicator */}
                            {typingStatus && Object.values(typingStatus).some(Boolean) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center space-x-2 text-muted-foreground text-xs px-2"
                                >
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-0" />
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-300" />
                                    </div>
                                    <span>Typing...</span>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-muted/20 border-t border-border">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={handleInputChange}
                                    placeholder="Type a message..."
                                    className="flex-1 py-2 px-3 text-sm rounded-full bg-background border border-input focus:ring-1 focus:ring-ring outline-none transition-all placeholder:text-muted-foreground/50"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
