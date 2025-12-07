
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Share2, Menu, X, Github, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium transition-colors hover:text-cyan-400 ${isActive ? 'text-cyan-400' : 'text-slate-400'
        }`;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-1.5 shadow-lg shadow-cyan-500/20">
                            <Share2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Sharencrypt
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink to="/" className={navLinkClass}>Home</NavLink>
                        <NavLink to="/guide" className={navLinkClass}>How to Use</NavLink>
                        <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <a
                            href="https://github.com/pragnesh-singh-rajput"
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <Github className="w-5 h-5" />
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-400 hover:text-white p-2"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-slate-900 border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <NavLink
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block py-2 text-base font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/guide"
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block py-2 text-base font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`
                                }
                            >
                                How to Use
                            </NavLink>
                            <NavLink
                                to="/faq"
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block py-2 text-base font-medium ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}`
                                }
                            >
                                FAQ
                            </NavLink>
                            <div className="pt-4 border-t border-slate-800">
                                <a
                                    href="https://github.com/pragnesh-singh-rajput"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-slate-400 hover:text-white"
                                >
                                    <Github className="w-5 h-5" />
                                    <span>GitHub</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
