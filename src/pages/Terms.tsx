
import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

export function Terms() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-slate-300">
            <div className="mb-12 border-b border-slate-800 pb-8">
                <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                    <FileText className="w-10 h-10 text-cyan-400" />
                    Terms of Service
                </h1>
                <p className="text-slate-500">Effective Date: December 2025</p>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                    <p className="leading-relaxed">
                        By accessing and using Sharencrypt, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">2. Acceptable Use</h2>
                    <p className="leading-relaxed mb-4">
                        You agree to use Sharencrypt only for lawful purposes. You represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to share any files you transfer using the service.
                    </p>
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            Prohibited Activities
                        </div>
                        <p className="text-sm text-rose-200">
                            You must not use this service to transfer illegal content, malware, viruses, or any material that infringes on the intellectual property rights of others.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">3. Disclaimer of Warranties</h2>
                    <p className="leading-relaxed">
                        The service is provided on an "as is" and "as available" basis. Sharencrypt makes no representations or warranties of any kind, express or implied, as to the operation of the service or the information, content, or materials included.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-white mb-4">4. Limitation of Liability</h2>
                    <p className="leading-relaxed">
                        In no event shall Sharencrypt or its contributors be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the service.
                    </p>
                </section>
            </div>
        </div>
    );
}
