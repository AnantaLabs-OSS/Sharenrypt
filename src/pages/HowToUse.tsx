
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Upload, Zap, ShieldCheck, Server, Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function HowToUse() {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [hash]);

    const steps = [
        {
            icon: <Wifi className="w-8 h-8 text-primary" />,
            title: "1. Connect",
            description: "Open Sharencrypt on two devices. They can be anywhere in the world. Click 'Connect' and scan the QR code or enter the Peer ID."
        },
        {
            icon: <Upload className="w-8 h-8 text-purple-500" />,
            title: "2. Select Files",
            description: "Drag and drop any file—images, videos, zips—directly into the browser window. Or click 'Send File' to browse."
        },
        {
            icon: <Zap className="w-8 h-8 text-emerald-500" />,
            title: "3. Fast Transfer",
            description: "Sharencrypt establishes a direct P2P link. Data flies directly between devices, encrypted and blazingly fast."
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
                >
                    Share Security details, Share Speed
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                    No signup. No cloud limits. Just direct, encrypted file sharing.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                {steps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className="p-8 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all relative group"
                    >
                        <div className="absolute top-0 right-0 p-20 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100" />

                        <div className="bg-muted rounded-xl p-4 w-fit mb-6 border border-border">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </motion.div>
                ))}
            </div>

            {/* STUN/TURN Section */}
            <div id="stun-turn" className="scroll-mt-24 mb-24">
                <div className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-secondary/10 rounded-xl">
                                <Server className="w-8 h-8 text-secondary" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">Advanced: STUN & TURN Servers</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2">What are they?</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        WebRTC (the technology Sharencrypt uses) tries to connect devices directly (P2P).
                                        However, firewalls and routers (NAT) often block these direct paths.
                                    </p>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <strong className="text-foreground">STUN (Session Traversal Utilities for NAT):</strong>
                                            <p className="text-sm text-muted-foreground">Tells your device what its public IP address is. Free and lightweight. Sharencrypt uses Google's public STUN servers by default.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <Server className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                                        <div>
                                            <strong className="text-foreground">TURN (Traversal Using Relays around NAT):</strong>
                                            <p className="text-sm text-muted-foreground">Relays traffic when a direct connection fails completely. Hosting a TURN server costs money (bandwidth). If Sharencrypt fails to connect, you might need a custom TURN server.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-muted/30 rounded-2xl p-6 border border-border">
                                <h3 className="text-lg font-semibold text-foreground mb-4">How to Add Custom Servers</h3>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    <p>
                                        1. Go to <strong>Settings</strong> {'>'} <strong>Network</strong>.
                                    </p>
                                    <p>
                                        2. Enter your server URL (e.g., <code>turn:your-server.com:3478</code>).
                                    </p>
                                    <p>
                                        3. Enter the Username and Credential if required.
                                    </p>
                                    <p>
                                        4. Click <strong>Add Server</strong> and refresh the page.
                                    </p>

                                    <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <p className="font-medium text-primary mb-1">Need a free TURN server?</p>
                                        <p>
                                            Services like <a href="https://www.metered.ca/tools/openrelay/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">OpenRelay</a> offer free TURN credentials for small projects.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 rounded-3xl bg-muted/30 border border-primary/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50 pointer-events-none"></div>
                <div className="relative z-10">
                    <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">End-to-End Encrypted</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Your files are encrypted in your browser before they leave your device. Only the intended recipient can decrypt them.
                    </p>
                </div>
            </div>
        </div>
    );
}
