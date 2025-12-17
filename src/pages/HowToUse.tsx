
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Upload, Zap, ShieldCheck, Server, Globe, Smartphone, Monitor, ArrowRight } from 'lucide-react';
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
            description: "Open Sharencrypt on two devices anywhere in the world. Click 'Connect' and scan the QR code or enter the Peer ID. Connection established in seconds!",
            details: ["Cross-platform compatible", "QR code for easy mobile pairing", "Direct P2P connection"]
        },
        {
            icon: <Upload className="w-8 h-8 text-purple-500" />,
            title: "2. Select Files",
            description: "Drag and drop any file—images, videos, documents, zips—directly into the browser window. Or click 'Send File' to browse your files.",
            details: ["Unlimited file size", "Multiple file types supported", "Drag & drop interface"]
        },
        {
            icon: <Zap className="w-8 h-8 text-emerald-500" />,
            title: "3. Fast Transfer",
            description: "Sharencrypt establishes a direct P2P link. Data flies directly between devices, encrypted and blazingly fast with adaptive chunk sizing.",
            details: ["Up to 15x faster for large files", "Real-time progress tracking", "Automatic speed optimization"]
        }
    ];

    const features = [
        {
            icon: <ShieldCheck className="w-6 h-6 text-primary" />,
            title: "Bank-Level Encryption",
            description: "AES-GCM 256-bit encryption ensures your files are secure during transfer."
        },
        {
            icon: <Server className="w-6 h-6 text-secondary" />,
            title: "No Cloud Storage",
            description: "Files never touch our servers. Direct peer-to-peer transfer only."
        },
        {
            icon: <Smartphone className="w-6 h-6 text-emerald-500" />,
            title: "Cross-Device",
            description: "Works seamlessly between desktop, mobile, and tablet devices."
        },
        {
            icon: <Monitor className="w-6 h-6 text-purple-500" />,
            title: "Browser-Based",
            description: "No downloads or installations required. Works in any modern browser."
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Hero Section */}
            <div className="text-center mb-20">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight bg-clip-text"
                >
                    Share Security, Share Speed
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                >
                    No signup. No cloud limits. No compromise. Just direct, encrypted file sharing at lightning speed.
                </motion.p>
            </div>

            {/* How It Works Steps */}
            <div className="mb-24">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-center text-foreground mb-12"
                >
                    How It Works
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all group"
                        >
                            {/* Connection Arrow */}
                            {idx < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                    <ArrowRight className="w-8 h-8 text-primary/30" />
                                </div>
                            )}

                            <div className="bg-muted rounded-2xl p-4 w-fit mb-6 border border-border group-hover:border-primary/20 transition-colors">
                                {step.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed mb-4">{step.description}</p>

                            <ul className="space-y-2">
                                {step.details.map((detail, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <div className="mb-24">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-center text-foreground mb-12"
                >
                    Why Choose Sharencrypt?
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + (idx * 0.05) }}
                            className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                {feature.icon}
                                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* STUN/TURN Section */}
            <div id="stun-turn" className="scroll-mt-24 mb-24">
                <div className="bg-card border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
                                <Server className="w-8 h-8 text-secondary" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-foreground">Advanced Configuration</h2>
                                <p className="text-muted-foreground">STUN & TURN Servers for Enhanced Connectivity</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground mb-3">What are they?</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        WebRTC (the technology Sharencrypt uses) tries to connect devices directly (P2P).
                                        However, firewalls and routers (NAT) often block these direct paths.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                                        <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <strong className="text-foreground font-semibold">STUN Servers</strong>
                                            <p className="text-sm text-muted-foreground mt-1">Tells your device its public IP address. Free and lightweight. Sharencrypt uses Google's public STUN servers by default.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border">
                                        <Server className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                                        <div>
                                            <strong className="text-foreground font-semibold">TURN Servers</strong>
                                            <p className="text-sm text-muted-foreground mt-1">Relays traffic when direct connection fails. If Sharencrypt can't connect, you might need a custom TURN server.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 rounded-2xl p-8 border border-border">
                                <h3 className="text-lg font-semibold text-foreground mb-6">How to Add Custom Servers</h3>
                                <div className="space-y-4 text-sm text-muted-foreground">
                                    {[
                                        "Go to Settings → Network",
                                        "Enter your server URL (e.g., turn:your-server.com:3478)",
                                        "Enter Username and Credential if required",
                                        "Click Add Server and refresh the page"
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                                                {i + 1}
                                            </div>
                                            <p className="pt-0.5">{step}</p>
                                        </div>
                                    ))}

                                    <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                                        <p className="font-semibold text-primary mb-2">Need a free TURN server?</p>
                                        <p className="text-sm">
                                            Services like <a href="https://www.metered.ca/tools/openrelay/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary font-medium">OpenRelay</a> offer free TURN credentials for small projects.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50 pointer-events-none"></div>
                <div className="relative z-10">
                    <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-foreground mb-4">End-to-End Encrypted</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Your files are encrypted in your browser before they leave your device.
                        Only the intended recipient can decrypt them. Zero-knowledge architecture means
                        complete privacy and security.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
