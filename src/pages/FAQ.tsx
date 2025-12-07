
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

export function FAQ() {
    const faqs = [
        {
            q: "Is Sharencrypt really free?",
            a: "Yes, Sharencrypt is 100% free and open source. Since it's Peer-to-Peer (P2P), we don't have expensive server bills for file storage effectively passing the savings to you."
        },
        {
            q: "Is there a file size limit?",
            a: "Technically, no. Since files stream directly between devices, there's no server imposition. However, very large files (GBs) depend on your browser's memory and stability."
        },
        {
            q: "Are my files stored on a server?",
            a: "Never. Files travel directly from Sender to Recipient via WebRTC. If the sender closes the tab, the transfer stops immediately."
        },
        {
            q: "How does the encryption work?",
            a: "We use AES-GCM 256-bit encryption. A unique key is generated for every transfer, and the IV is shared securely via the signaling channel."
        },
        {
            q: "Can I use it on mobile?",
            a: "Absolutely! Sharencrypt works in any modern browser (Chrome, Firefox, Safari) on iOS and Android."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
                    <HelpCircle className="w-8 h-8 text-primary" />
                    Common Questions
                </h1>
                <p className="text-muted-foreground">Everything you need to know about Sharencrypt.</p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="rounded-xl bg-card border border-border overflow-hidden"
                    >
                        <details className="group">
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-muted/30 transition-colors">
                                <h3 className="text-lg font-medium text-foreground">{faq.q}</h3>
                                <span className="text-primary transition-transform group-open:rotate-180">
                                    <ChevronDown className="w-5 h-5" />
                                </span>
                            </summary>
                            <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4 bg-muted/10">
                                {faq.a}
                            </div>
                        </details>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
