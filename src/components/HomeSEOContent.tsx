
import React from 'react';
import { Shield, Zap, Globe, Lock, Server, FileText, CheckCircle, ArrowRight } from 'lucide-react';

export function HomeSEOContent() {
    return (
        <section className="mt-24 pt-16 border-t border-border">
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Introduction / H1 equivalent for SEO contextualization (Visually H2) */}
                <div className="text-center space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                        The Best Way to Send Large Files Securely & Free
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Sharencrypt transforms how you share data. By leveraging advanced WebRTC technology,
                        we enable direct peer-to-peer file transfers that completely bypass cloud servers.
                        Send files of any size, anywhere in the world, with bank-grade encryption and zero bandwidth limits.
                    </p>
                </div>

                {/* Key Benefit Blocks */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-card/50 p-8 rounded-2xl border border-border/50 hover:border-primary/20 transition-colors">
                        <Lock className="w-10 h-10 text-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-3">End-to-End Encryption (E2EE)</h3>
                        <p className="text-muted-foreground">
                            Security isn't an afterthought; it's our foundation. Every file you share is encrypted
                            directly in your browser using AES-GCM 256-bit encryption before it ever touches the network.
                            The encryption keys are generated on-the-fly and shared only with your recipient.
                            We (Ananta Labs) cannot see, read, or access your files even if we wanted to.
                        </p>
                    </div>

                    <div className="bg-card/50 p-8 rounded-2xl border border-border/50 hover:border-primary/20 transition-colors">
                        <Zap className="w-10 h-10 text-secondary mb-4" />
                        <h3 className="text-xl font-semibold mb-3">Unlimited File Sizes</h3>
                        <p className="text-muted-foreground">
                            Most file sharing services impose strict limits—2GB, 5GB, maybe 10GB if you pay.
                            Sharencrypt removes these barriers. Because we don't store your data, there are no
                            storage costs to cover. Send 50GB, 100GB, or even a terabyte of data.
                            As long as your device stays online, the transfer continues.
                        </p>
                    </div>
                </div>

                {/* Detailed SEO Text Block */}
                <article className="prose prose-invert max-w-none">
                    <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose Peer-to-Peer File Sharing?</h3>
                    <p className="text-muted-foreground mb-6">
                        Traditional cloud storage services like Google Drive, Dropbox, or WeTransfer operate on a "Store and Forward" model.
                        You upload a file to their server (Wait time #1), they process it, and then your recipient downloads it (Wait time #2).
                        This doubles the time required and creates a permanent copy of your data on a third-party server.
                    </p>
                    <p className="text-muted-foreground mb-6">
                        <strong>Sharencrypt is different.</strong> We create a direct data tunnel between you and your recipient.
                        When you select a file, pieces of it are streamed instantly to the other person.
                        This means:
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-4 list-none pl-0 mb-8">
                        {[
                            "Zero waiting for uploads to finish before downloading starts",
                            "Maximum privacy - no middleman servers",
                            "Lightning fast LAN transfer speeds if on the same WiFi",
                            "No government or corporate snooping",
                            "Resume capability for interrupted transfers",
                            "100% Free Forever - Open Source Software"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <h3 className="text-2xl font-bold text-foreground mb-4">Perfect for Professionals</h3>
                    <div className="grid sm:grid-cols-3 gap-6 mb-12">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                Video Editors
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Send massive RAW footage and project files to clients or collaborators without waiting for cloud processing.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Server className="w-4 h-4 text-purple-400" />
                                Developers
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Share large database dumps, docker images, or build artifacts securely within your team or across networks.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-emerald-400" />
                                Everyone
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                From family photo albums to personal documents, share anything with the peace of mind that your data remains yours.
                            </p>
                        </div>
                    </div>
                </article>

                {/* Technical Deep Dive Container */}
                <div className="bg-muted/30 rounded-3xl p-8 border border-border">
                    <h3 className="text-2xl font-bold text-foreground mb-6">How It Works Under the Hood</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                            <div>
                                <h4 className="font-semibold text-foreground">Signaling Phase</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your browser connects to our lightweight signaling server just long enough to say "Hello"
                                    and exchange connection candidates (ICE candidates). This puts your device on the map securely
                                    using a temporary Peer ID.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                            <div>
                                <h4 className="font-semibold text-foreground">Hole Punching & Handshake</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    We use STUN/TURN servers to navigate through firewalls and NAT routers. Once a path is found,
                                    a direct P2P connection (DataChannel) is established. This tunnel is secured with DTLS (Datagram Transport Layer Security).
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                            <div>
                                <h4 className="font-semibold text-foreground">Data Streaming</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Files are read from your disk in small chunks, encrypted instantly, and shot across the network.
                                    The recipient decrypts them and writes them to disk in real-time. We use intelligent buffering
                                    to ensure we never use too much RAM, even for 1TB+ files.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8 pb-4">
                    <p className="text-sm text-muted-foreground">
                        Ready to start? Scroll up to connect and share instantly.
                        No registration required.
                    </p>
                </div>
            </div>
        </section>
    );
}
