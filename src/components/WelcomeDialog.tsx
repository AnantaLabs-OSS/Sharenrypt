
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, ShieldCheck } from 'lucide-react';

interface WelcomeDialogProps {
    isOpen: boolean;
    onSubmit: (username: string) => void;
}

export const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ isOpen, onSubmit }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onSubmit(username.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-card border border-border rounded-xl p-8 max-w-md w-full shadow-xl relative overflow-hidden"
                >
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
                                <ShieldCheck className="w-12 h-12 text-primary" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-foreground mb-2">
                            Welcome to Sharencrypt
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Choose a display name to be identified by other peers. This is only stored locally during the session.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your display name"
                                    className="w-full bg-background border border-input rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all shadow-sm"
                                    autoFocus
                                    maxLength={20}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!username.trim()}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
                            >
                                <span>Get Started</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
