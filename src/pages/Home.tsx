import React, { useCallback, useState } from 'react';
import { Share2, Upload, Users, X, QrCode, Scan, MessageSquare, Zap, Clock, Settings, Shield, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { usePeerConnection } from '../hooks/usePeerConnection';
import { FileList } from '../components/FileList';
import { QRScanner } from '../components/QRScanner';
import { ConnectionDialog } from '../components/ConnectionDialog';
import { WelcomeDialog } from '../components/WelcomeDialog';
import { SoundToggle } from '../components/SoundToggle';
import { Chat } from '../components/Chat';
import { HistoryDialog } from '../components/HistoryDialog';
import { SettingsDialog } from '../components/SettingsDialog';
import { DragDropOverlay } from '../components/DragDropOverlay';
import { analytics } from '../utils/analytics';

export function Home() {
    const {
        peerId,
        connections,
        files,
        messages,
        connectionStatus,
        connectToPeer,
        sendFile,
        sendTextMessage,
        disconnectPeer,
        retryConnection,
        username,
        setUsername,
        sendZip,
        typingStatus,
        sendTyping,
        markMessageAsRead
    } = usePeerConnection();

    const [showQR, setShowQR] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showConnectDialog, setShowConnectDialog] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [targetPeerId, setTargetPeerId] = useState('');
    const [copied, setCopied] = useState(false);

    // Logic to show welcome dialog: if no username
    const showWelcome = !username;

    // Initialize Analytics
    React.useEffect(() => {
        analytics.initialize();
    }, []);

    // Calculate global unread count
    const unreadCount = messages.filter(m => !m.self && m.status !== 'read').length;

    const handleConnect = useCallback(() => {
        setShowConnectDialog(true);
    }, []);

    const handleConnectSubmit = useCallback(() => {
        if (targetPeerId.trim()) {
            connectToPeer(targetPeerId.trim());
            analytics.trackEvent('Connection', 'Initiated', 'Manual');
        }
        setShowConnectDialog(false);
    }, [targetPeerId, connectToPeer]);

    const handleCopyId = () => {
        navigator.clipboard.writeText(peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedMap = event.target.files;
            if (selectedMap && selectedMap.length > 0 && connections.length > 0) {
                const fileList = Array.from(selectedMap);

                if (fileList.length > 1) {
                    sendZip(connections[0].id, fileList);
                    analytics.trackEvent('File', 'SelectBatch', 'Input', fileList.length);
                } else {
                    sendFile(fileList[0], connections[0].id);
                    analytics.trackEvent('File', 'Select', 'Input', fileList[0].size);
                }
            }
        },
        [connections, sendFile, sendZip]
    );

    const handleFileDrop = useCallback(
        (droppedFiles: File[]) => {
            if (droppedFiles && droppedFiles.length > 0 && connections.length > 0) {
                // If multiple files or folder structure detected, use Zip
                const shouldZip = droppedFiles.length > 1 || (droppedFiles[0] as any).webkitRelativePath?.includes('/');

                if (shouldZip) {
                    sendZip(connections[0].id, droppedFiles);
                    analytics.trackEvent('File', 'DropBatch', 'Overlay', droppedFiles.length);
                } else {
                    sendFile(droppedFiles[0], connections[0].id);
                    analytics.trackEvent('File', 'Drop', 'Overlay', droppedFiles[0].size);
                }
            }
        },
        [connections, sendFile, sendZip]
    );

    const handleScan = useCallback((scannedPeerId: string) => {
        connectToPeer(scannedPeerId);
        setShowScanner(false);
    }, [connectToPeer]);

    const handleSendMessage = useCallback((text: string) => {
        if (connections.length > 0) {
            // Broadcast to all connected peers for now, or just the first one
            connections.forEach(conn => sendTextMessage(text, conn.id));
        }
    }, [connections, sendTextMessage]);

    return (
        <div className="relative min-h-[calc(100vh-4rem)]">
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'bg-popover text-popover-foreground border border-border shadow-md',
                    style: {
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                    },
                }}
            />

            <DragDropOverlay onFileDrop={handleFileDrop} isConnect={connections.length > 0} />

            <AnimatePresence>
                {showConnectDialog && (
                    <ConnectionDialog
                        targetPeerId={targetPeerId}
                        setTargetPeerId={setTargetPeerId}
                        onConnect={handleConnectSubmit}
                        onCancel={() => setShowConnectDialog(false)}
                        connectionStatus={connectionStatus}
                        onRetry={() => retryConnection(targetPeerId)}
                    />
                )}
            </AnimatePresence>

            <WelcomeDialog
                isOpen={showWelcome}
                onSubmit={setUsername}
            />

            <AnimatePresence>
                {showHistory && (
                    <HistoryDialog isOpen={showHistory} onClose={() => setShowHistory(false)} />
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                {/* Header Actions Row */}
                <div className="flex justify-end gap-2 mb-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowHistory(true)}
                        className="p-2.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors shadow-sm"
                        title="Transfer History"
                    >
                        <Clock className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSettings(true)}
                        className="p-2.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors shadow-sm"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </motion.button>
                    <div className="bg-card border border-border rounded-lg p-1">
                        <SoundToggle />
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar: Identity & Controls - Authority Slate (20%) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Identity Card */}
                        <div className="bg-gradient-to-br from-primary via-primary to-[#0B1221] border border-white/10 rounded-2xl shadow-xl shadow-primary/20 overflow-hidden text-primary-foreground relative group/card">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                            <div className="p-6 relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Your Identity</h2>
                                        <p className="text-sm text-primary-foreground/80 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(var(--secondary),0.6)]"></span>
                                            Online as <span className="font-medium text-white">{username || 'Guest'}</span>
                                        </p>
                                    </div>
                                    <Shield className="w-8 h-8 text-white/20" />
                                </div>

                                <div className="relative group">
                                    <div
                                        onClick={handleCopyId}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pr-10 font-mono text-sm text-white break-all cursor-pointer hover:bg-black/30 transition-colors"
                                    >
                                        {peerId}
                                    </div>
                                    <button
                                        onClick={handleCopyId}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <button
                                        onClick={() => setShowScanner(true)}
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all text-sm font-medium"
                                    >
                                        <Scan className="w-4 h-4" />
                                        Scan QR
                                    </button>
                                    <button
                                        onClick={() => setShowQR(!showQR)}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all text-sm font-medium ${showQR ? 'bg-white/10 ring-1 ring-white/20' : ''}`}
                                    >
                                        <QrCode className="w-4 h-4" />
                                        Show QR
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showQR && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-6 flex justify-center bg-white p-4 rounded-lg shadow-inner"
                                        >
                                            <QRCodeSVG value={peerId} size={160} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Connection Status Card */}
                        <div className="bg-gradient-to-br from-primary via-primary to-[#0B1221] border border-white/10 rounded-2xl shadow-xl shadow-primary/20 p-6 flex flex-col h-full min-h-[200px] text-primary-foreground relative group/card">
                            {/* Decorative background glow */}
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <h3 className="font-semibold text-white">Connections</h3>
                                <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-full border border-white/5">{connections.length}</span>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar relative z-10">
                                <AnimatePresence>
                                    {connections.length > 0 ? (
                                        connections.map((connection) => (
                                            <motion.div
                                                key={connection.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-secondary/50 transition-all group"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-secondary/30">
                                                        {(connection.username || connection.id).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden leading-tight">
                                                        <span className="text-sm font-medium text-white truncate">{connection.username || 'Anonymous'}</span>
                                                        <span className="text-xs text-white/50 font-mono truncate">{connection.id.substring(0, 8)}...</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => disconnectPeer(connection.id)}
                                                    className="text-white/40 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Disconnect"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="h-32 flex flex-col items-center justify-center text-white/30 text-center border-2 border-dashed border-white/10 rounded-lg">
                                            <Users className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-sm">No peers connected</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="mt-6 space-y-3 relative z-10">
                                <button
                                    onClick={handleConnect}
                                    className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white font-semibold rounded-lg shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                                >
                                    <Users className="w-4 h-4" />
                                    Connect New Peer
                                </button>
                                {connections.length > 0 && (
                                    <button
                                        onClick={() => setShowChat(true)}
                                        className="hidden sm:flex w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg border border-white/10 transition-all items-center justify-center gap-2 relative"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Open Chat
                                        {!showChat && unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Floating Action Button (Mobile Only) - Updated Position/Color */}
                        {connections.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowChat(true)}
                                className="fixed bottom-24 right-6 p-4 bg-secondary text-white rounded-full shadow-lg shadow-secondary/30 sm:hidden z-30"
                            >
                                <MessageSquare className="w-6 h-6" />
                                {!showChat && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </motion.button>
                        )}
                    </div>

                    {/* Right Content: File Transfer */}
                    <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
                        <div className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-primary" />
                                    File Transfer
                                </h2>
                                <label
                                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 cursor-pointer transition-all ${connections.length > 0
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="hidden sm:inline">Choose Files</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        onChange={handleFileSelect}
                                        disabled={connections.length === 0}
                                    />
                                </label>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto bg-muted/5 custom-scrollbar relative">
                                {files.length > 0 ? (
                                    <FileList files={files} />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                        <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                                            <Upload className="w-10 h-10 text-muted-foreground/40" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Transfer</h3>
                                        <p className="text-muted-foreground max-w-md mx-auto mb-8">
                                            Connect to a peer and drag & drop files here to start sharing securely.
                                        </p>
                                        {connections.length === 0 && (
                                            <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full">
                                                <Zap className="w-4 h-4" />
                                                Connection required to send files
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showScanner && (
                    <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showChat && (
                    <Chat
                        messages={messages}
                        connections={connections}
                        onSendMessage={handleSendMessage}
                        onMarkAsRead={markMessageAsRead}
                        isOpen={showChat}
                        onClose={() => setShowChat(false)}
                        onClear={() => { }}
                        typingStatus={typingStatus}
                        onSendTyping={(isTyping) => {
                            if (connections.length > 0) {
                                connections.forEach(conn => sendTyping(conn.id, isTyping));
                            }
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Settings Dialog (Persistent) */}
            <AnimatePresence>
                {showSettings && (
                    <SettingsDialog
                        isOpen={showSettings}
                        onClose={() => setShowSettings(false)}
                        currentPeerId={peerId}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
