
import React from 'react';
import { Shield, Lock, EyeOff } from 'lucide-react';

export function Privacy() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300">
            <div className="mb-12 border-b border-slate-800 pb-8">
                <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                    <Shield className="w-10 h-10 text-emerald-400" />
                    Privacy Policy
                </h1>
                <p className="text-slate-500">Last updated: December 2025</p>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
                    <p className="leading-relaxed">
                        Sharencrypt ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how our peer-to-peer (P2P) file transfer service operates and how it handles your data.
                        <br /><br />
                        <strong>Core Principle:</strong> We do not store your files. We do not track your activity.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Data Collection (or lack thereof)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-2 mb-2 text-rose-400">
                                <EyeOff className="w-5 h-5" />
                                <span className="font-bold">We DO NOT Collect:</span>
                            </div>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-400">
                                <li>Files you transfer</li>
                                <li>Filenames or metadata</li>
                                <li>IP addresses logs</li>
                                <li>Your personal identity</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                <Shield className="w-5 h-5" />
                                <span className="font-bold">Ephemeral Data Only:</span>
                            </div>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-400">
                                <li>Temporary signaling data (WebRTC handshake)</li>
                                <li>Local browser storage (for your settings)</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">3. How Transfers Work</h2>
                    <p className="leading-relaxed">
                        Sharencrypt utilizes WebRTC technology to establish a direct connection between your device and the recipient's device.
                        The signaling server is used <em>only</em> to introduce the two peers. Once connected, data flows directly between devices.
                        All files are end-to-end encrypted using AES-GCM before transmission.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">4. Local Storage</h2>
                    <p className="leading-relaxed">
                        We use your browser's Local Storage to save preferences such as:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                        <li>Your persistent Peer ID (if locked)</li>
                        <li>Custom STUN/TURN server configurations</li>
                        <li>Sound preferences</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">5. Contact</h2>
                    <p className="leading-relaxed">
                        For any privacy-related questions, please open an issue on our GitHub repository.
                    </p>
                </section>
            </div>
        </div>
    );
}
