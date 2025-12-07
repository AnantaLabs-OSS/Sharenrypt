
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Share2, Menu, X, Github, Moon, Sun, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'
        }`;

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    const ThemeIcon = () => {
        if (theme === 'light') return <Sun className="w-5 h-5" />;
        if (theme === 'dark') return <Moon className="w-5 h-5" />;
        return <Laptop className="w-5 h-5" />;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <NavLink to="/" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="bg-primary/10 rounded-lg p-1.5 transition-colors group-hover:bg-primary/20">
                            <Share2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg text-foreground tracking-tight">
                            Sharencrypt
                        </span>
                    </NavLink>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink to="/" className={navLinkClass}>Home</NavLink>
                        <NavLink to="/guide" className={navLinkClass}>How to Use</NavLink>
                        <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-accent"
                            title={`Theme: ${theme}`}
                        >
                            <ThemeIcon />
                        </button>
                        <a
                            href="https://github.com/pragnesh-singh-rajput"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="w-5 h-5" />
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="text-muted-foreground hover:text-foreground transition-colors p-2"
                        >
                            <ThemeIcon />
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-muted-foreground hover:text-foreground p-2"
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
                        className="md:hidden bg-background border-b border-border overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <NavLink
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block py-3 px-2 rounded-md text-base font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/guide"
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block py-3 px-2 rounded-md text-base font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`
                                }
                            >
                                How to Use
                            </NavLink>
                            <NavLink
                                to="/faq"
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) =>
                                    `block py-3 px-2 rounded-md text-base font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`
                                }
                            >
                                FAQ
                            </NavLink>
                            <div className="pt-4 mt-2 border-t border-border">
                                <a
                                    href="https://github.com/pragnesh-singh-rajput"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-2 py-3 text-muted-foreground hover:text-foreground"
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
