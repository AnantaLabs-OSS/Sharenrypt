
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, Shield, Zap, Globe, Lock, FileText, Server } from 'lucide-react';

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            q: "Is Sharencrypt really free?",
            a: "Yes! Sharencrypt is 100% free and open source. Since it's Peer-to-Peer (P2P), we don't have expensive server bills for file storage, effectively passing the savings to you. No hidden fees, no subscriptions.",
            icon: <Zap className="w-5 h-5 text-emerald-500" />
        },
        {
            q: "Is there a file size limit?",
            a: "Technically, no! Since files stream directly between devices, there's no server-imposed limit. With our enhanced disk streaming feature, you can transfer files of unlimited size without worrying about browser RAM limits. Very large files (GBs) transfer smoothly thanks to our buffered write system.",
            icon: <FileText className="w-5 h-5 text-blue-500" />
        },
        {
            q: "Are my files stored on a server?",
            a: "Never! Files travel directly from sender to recipient via WebRTC. Your data never touches our servers. If either party closes their browser, the transfer stops immediately. Complete privacy guaranteed.",
            icon: <Shield className="w-5 h-5 text-purple-500" />
        },
        {
            q: "How does the encryption work?",
            a: "We use AES-GCM 256-bit encryption - the same standard used by banks and governments. A unique encryption key is generated for every transfer in your browser. The key is shared securely via the signaling channel and never leaves your device in plain form.",
            icon: <Lock className="w-5 h-5 text-red-500" />
        },
        {
            q: "Can I use it on mobile?",
            a: "Absolutely! Sharencrypt works in any modern browser (Chrome, Firefox, Safari) on iOS and Android. The interface is fully responsive and optimized for touch devices. QR code scanning makes mobile connections super easy!",
            icon: <Globe className="w-5 h-5 text-orange-500" />
        },
        {
            q: "What happens if the connection drops?",
            a: "If the connection is interrupted, the transfer will pause. You can retry the connection to resume. For very large files, we recommend using a stable WiFi connection and keeping both devices active during the transfer.",
            icon: <Server className="w-5 h-5 text-cyan-500" />
        },
        {
            q: "Do both devices need to be online simultaneously?",
            a: "Yes. Since Sharencrypt uses direct P2P transfer, both the sender and receiver must be online and connected at the same time. Think of it like a phone call - both parties need to be present for it to work.",
            icon: <Globe className="w-5 h-5 text-pink-500" />
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
                >
                    <HelpCircle className="w-8 h-8 text-primary" />
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                >
                    Frequently Asked Questions
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-muted-foreground max-w-2xl mx-auto"
                >
                    Everything you need to know about secure file sharing with Sharencrypt.
                </motion.p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 transition-colors"
                    >
                        <details
                            className="group"
                            open={openIndex === idx}
                            onToggle={(e) => setOpenIndex((e.target as HTMLDetailsElement).open ? idx : null)}
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">{faq.icon}</div>
                                    <h3 className="text-lg font-semibold text-foreground">{faq.q}</h3>
                                </div>
                                <span className="text-primary transition-transform duration-200 group-open:rotate-180">
                                    <ChevronDown className="w-5 h-5" />
                                </span>
                            </summary>
                            <motion.div
                                initial={false}
                                animate={{ height: openIndex === idx ? 'auto' : 0 }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 pb-6 pl-[5.5rem] text-muted-foreground leading-relaxed border-t border-border/50 pt-4 bg-muted/5">
                                    {faq.a}
                                </div>
                            </motion.div>
                        </details>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center"
            >
                <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
                <p className="text-muted-foreground mb-4">
                    Sharencrypt is open source! Check out our GitHub repository or reach out to the community.
                </p>
                <a
                    href="https://github.com/pragnesh-singh-rajput"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Visit GitHub
                </a>
            </motion.div>
        </div>
    );
}
