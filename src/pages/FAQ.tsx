import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, Shield, Zap, Globe, Lock, FileText, Server } from 'lucide-react';
import { SEO } from '../components/SEO';

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            q: "Is Sharencrypt really free?",
            a: "Yes! Sharencrypt is 100% free and open source. Since it's Peer-to-Peer (P2P), we don't have expensive server bills for file storage, effectively passing the savings to you. No hidden fees, no subscriptions.",
            icon: <Zap className="w-5 h-5 text-emerald-500" />
        },
        {
            q: "How secure is Sharencrypt file transfer?",
            a: "We employ military-grade security standards. Every session creates a new, ephemeral 256-bit AES-GCM key pair. This is a higher standard than many banking apps. Furthermore, since there is no intermediate server storage, there is no central database for hackers to target. Your files exist only on the sender's and receiver's devices.",
            icon: <Shield className="w-5 h-5 text-purple-500" />
        },
        {
            q: "Is Sharencrypt faster than WeTransfer or Google Drive?",
            a: "In most cases, yes! Cloud services require you to upload the file first (speed limited by your upload bandwidth) and then the recipient downloads it. Sharencrypt streams simultaneously. If you are on the same WiFi network (LAN), speeds can reach hundreds of megabytes per second, far exceeding internet limits.",
            icon: <Zap className="w-5 h-5 text-emerald-500" />
        },
        {
            q: "Why is there no file size limit?",
            a: "Because we don't pay for storage! Traditional services have limits (e.g. 2GB) because storing your data costs them money. Sharencrypt is a pipe, not a bucket. It connects two computers directly, so the only limit is the free space on the recipient's hard drive. You can share 50GB, 200GB, or 1TB files for free.",
            icon: <FileText className="w-5 h-5 text-blue-500" />
        },
        {
            q: "Can I send files to an iPhone or Android?",
            a: "Yes. Sharencrypt is a Progressive Web App (PWA) that runs in Safari, Chrome, and Firefox on mobile devices. You don't need to install an app from the store. Just open the website, scan the QR code from the sender, and the transfer begins immediately.",
            icon: <Globe className="w-5 h-5 text-orange-500" />
        },
        {
            q: "Is this better than email attachments?",
            a: "Email attachments are usually limited to 25MB and are not encrypted at rest. Sharencrypt allows unlimited sizes and guarantees end-to-end encryption. It is cleaner, faster, and more secure than sending sensitive documents via email.",
            icon: <Server className="w-5 h-5 text-cyan-500" />
        },
        {
            q: "Do I need to register an account?",
            a: "No. We believe in privacy by design. Registration requires collecting personal data, which creates risk. Sharencrypt works anonymously using temporary identifiers. You can just open the site and start sharing deeply private files without leaving a digital footprint.",
            icon: <Lock className="w-5 h-5 text-red-500" />
        },
        {
            q: "How does the encryption work?",
            a: "We use AES-GCM 256-bit encryption - the same standard used by banks and governments. A unique encryption key is generated for every transfer in your browser. The key is shared securely via the signaling channel and never leaves your device in plain form.",
            icon: <Lock className="w-5 h-5 text-red-500" />
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
            <SEO
                title="FAQ - Sharencrypt"
                description="Frequently asked questions about Sharencrypt security, free P2P transfers, and file size limits."
                canonical="/faq"
            />

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
