
import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, Upload, Zap, ShieldCheck } from 'lucide-react';

export function HowToUse() {
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

            <div className="mt-24 p-8 rounded-3xl bg-muted/30 border border-primary/20 text-center relative overflow-hidden">
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
