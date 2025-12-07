
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Lock, Unlock, Network, Plus, Trash2, Server } from 'lucide-react';
import { settingsService, CustomIceServer } from '../services/settingsService';
import toast from 'react-hot-toast';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentPeerId: string;
}

export function SettingsDialog({ isOpen, onClose, currentPeerId }: SettingsDialogProps) {
    const [activeTab, setActiveTab] = useState<'identity' | 'network'>('identity');
    const [isLocked, setIsLocked] = useState(false);
    const [customServers, setCustomServers] = useState<CustomIceServer[]>([]);
    const [newServer, setNewServer] = useState<CustomIceServer>({ urls: '' });

    useEffect(() => {
        if (isOpen) {
            // Load settings
            const savedId = settingsService.getSavedPeerId();
            setIsLocked(!!savedId);
            setCustomServers(settingsService.getIceServers());
        }
    }, [isOpen]);

    const handleToggleLock = () => {
        if (isLocked) {
            settingsService.clearPeerId();
            setIsLocked(false);
            toast.success('Identity unlocked. ID will change on refresh.');
        } else {
            settingsService.savePeerId(currentPeerId);
            setIsLocked(true);
            toast.success('Identity locked! ID will persist across refreshes.', { duration: 4000 });
        }
    };

    const handleAddServer = () => {
        if (!newServer.urls) {
            toast.error('Server URL is required');
            return;
        }
        // Basic validation
        if (!newServer.urls.startsWith('stun:') && !newServer.urls.startsWith('turn:')) {
            toast.error('URL must start with stun: or turn:');
            return;
        }

        const updated = [...customServers, newServer];
        setCustomServers(updated);
        settingsService.saveIceServers(updated);
        setNewServer({ urls: '' }); // Reset form
        toast.success('Server added. Refresh to apply.');
    };

    const handleRemoveServer = (index: number) => {
        const updated = [...customServers];
        updated.splice(index, 1);
        setCustomServers(updated);
        settingsService.saveIceServers(updated);
        toast.success('Server removed');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-card border border-border rounded-xl shadow-lg overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Server className="w-5 h-5 text-primary" />
                        Settings
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button
                        onClick={() => setActiveTab('identity')}
                        className={`flex-1 p-4 text-sm font-medium transition-colors ${activeTab === 'identity' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Identity
                    </button>
                    <button
                        onClick={() => setActiveTab('network')}
                        className={`flex-1 p-4 text-sm font-medium transition-colors ${activeTab === 'network' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Network (ICE)
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'identity' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                                <div>
                                    <h3 className="text-foreground font-medium mb-1">Peer ID Persistence</h3>
                                    <p className="text-sm text-muted-foreground">Keep the same ID after page refresh.</p>
                                </div>
                                <button
                                    onClick={handleToggleLock}
                                    className={`p-3 rounded-lg transition-all ${isLocked ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                                >
                                    {isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                                </button>
                            </div>

                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                                    <strong>Note:</strong> Locking your ID saves it to this browser. If you clear cache or use a different device, your ID will change.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'network' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-foreground font-medium mb-1">Custom ICE Servers</h3>
                                <p className="text-xs text-muted-foreground mb-4">Add your own STUN/TURN servers for better connectivity.</p>
                            </div>

                            {/* List */}
                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                {customServers.length === 0 && (
                                    <p className="text-center text-muted-foreground py-4 text-sm">No custom servers added.</p>
                                )}
                                {customServers.map((server, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-mono text-foreground truncate">{server.urls}</p>
                                            {server.username && <p className="text-[10px] text-muted-foreground">User: {server.username}</p>}
                                        </div>
                                        <button onClick={() => handleRemoveServer(idx)} className="text-muted-foreground hover:text-destructive">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Form */}
                            <div className="pt-4 border-t border-border space-y-3">
                                <input
                                    type="text"
                                    placeholder="STUN/TURN URL (e.g., stun:stun.l.google.com:19302)"
                                    value={newServer.urls}
                                    onChange={e => setNewServer({ ...newServer, urls: e.target.value })}
                                    className="w-full bg-background border border-input rounded-md p-2 text-sm text-foreground focus:ring-1 focus:ring-ring outline-none"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="Username (Optional)"
                                        value={newServer.username || ''}
                                        onChange={e => setNewServer({ ...newServer, username: e.target.value })}
                                        className="bg-background border border-input rounded-md p-2 text-sm text-foreground focus:ring-1 focus:ring-ring outline-none"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Credential (Optional)"
                                        value={newServer.credential || ''}
                                        onChange={e => setNewServer({ ...newServer, credential: e.target.value })}
                                        className="bg-background border border-input rounded-md p-2 text-sm text-foreground focus:ring-1 focus:ring-ring outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleAddServer}
                                    className="w-full py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-border"
                                >
                                    <Plus className="w-4 h-4" /> Add Server
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-muted/20 text-center text-xs text-muted-foreground border-t border-border">
                    Changes require a page refresh to take effect.
                </div>
            </motion.div>
        </div>
    );
}
