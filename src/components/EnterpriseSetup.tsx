import React, { useState } from 'react';
import { Shield, Key, Building2, CheckCircle2 } from 'lucide-react';
import { useLicense } from '../context/LicenseContext';
import { motion } from 'framer-motion';

export function EnterpriseSetup() {
    const { activateLicense, features } = useLicense();
    const [key, setKey] = useState('');
    const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('verifying');
        const result = await activateLicense(key);

        if (result.success) {
            setStatus('success');
            setTimeout(() => {
                window.location.reload(); // Reload to apply all enterprise settings
            }, 1500);
        } else {
            setStatus('error');
            setError(result.error || 'Invalid Enterprise License Key');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Organization Verified</h1>
                    <p className="text-muted-foreground">Setting up your secure environment...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground">Enterprise Setup</h2>
                    <p className="mt-2 text-muted-foreground">
                        This instance is configured for Organization Mode. Please enter your license key to continue.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-card border border-border p-8 rounded-xl shadow-lg">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="license-key" className="block text-sm font-medium text-foreground mb-1">
                                Organization License Key
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="license-key"
                                    name="license-key"
                                    type="text"
                                    required
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    className="block w-full pl-10 bg-background border border-input rounded-lg p-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                                    placeholder="ENT-XXXX-XXXX-XXXX"
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive font-medium flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'verifying' || !key}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {status === 'verifying' ? 'Verifying...' : 'Activate Workspace'}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                        <Building2 className="w-3 h-3" />
                        <span>Secure Enterprise Environment</span>
                    </div>
                </form>
            </div>
        </div>
    );
}
