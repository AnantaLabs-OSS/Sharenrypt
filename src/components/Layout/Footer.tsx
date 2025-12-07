
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Github, Shield, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <span className="font-bold text-lg text-foreground">Sharencrypt</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                            Secure, serverless P2P file sharing. Your data never touches a server.
                            Built for privacy, speed, and trust.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Product</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><NavLink to="/" className="hover:text-primary transition-colors">Home</NavLink></li>
                            <li><NavLink to="/guide" className="hover:text-primary transition-colors">How it Works</NavLink></li>
                            <li><NavLink to="/faq" className="hover:text-primary transition-colors">FAQ</NavLink></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-foreground font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><NavLink to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</NavLink></li>
                            <li><NavLink to="/terms" className="hover:text-primary transition-colors">Terms of Service</NavLink></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        © {new Date().getFullYear()} Sharencrypt. Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by Pragnesh Singh Rajput.
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://github.com/pragnesh-singh-rajput"
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
