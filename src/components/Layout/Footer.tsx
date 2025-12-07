
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Github, Shield } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-cyan-400" />
                            <span className="font-bold text-lg text-slate-200">Sharencrypt</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Secure, serverless P2P file sharing. Your data never touches a server.
                            Open source and privacy-focused.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-slate-200 font-medium mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><NavLink to="/guide" className="hover:text-cyan-400 transition-colors">How to Use</NavLink></li>
                            <li><NavLink to="/faq" className="hover:text-cyan-400 transition-colors">FAQ</NavLink></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-slate-200 font-medium mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><NavLink to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</NavLink></li>
                            <li><NavLink to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</NavLink></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} Sharencrypt. Built by Pragnesh Singh Rajput.
                    </p>
                    <a
                        href="https://github.com/pragnesh-singh-rajput"
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-600 hover:text-white transition-colors"
                    >
                        <Github className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </footer>
    );
}
