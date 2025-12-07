
import React, { useCallback, useState } from 'react';
import { Share2, Upload, Users, X, QrCode, Scan, MessageSquare, Zap, Clock, Settings, Shield, ChevronRight, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { usePeerConnection } from '../hooks/usePeerConnection';
import { FileList } from '../components/FileList';
import { QRScanner } from '../components/QRScanner';
import { ConnectionRequest } from '../components/ConnectionRequest';
import { ConnectionDialog } from '../components/ConnectionDialog';
import { WelcomeDialog } from '../components/WelcomeDialog';
import { SoundToggle } from '../components/SoundToggle';
import { Chat } from '../components/Chat';
import { HistoryDialog } from '../components/HistoryDialog';
import { SettingsDialog } from '../components/SettingsDialog';
import { DragDropOverlay } from '../components/DragDropOverlay';
import { analytics } from '../utils/analytics';
import { useTheme } from '../context/ThemeContext';

export function Home() {
    const {
        peerId,
        connections,
        files,
        messages,
        pendingConnections,
        connectionStatus,
        connectToPeer,
        sendFile,
        sendTextMessage,
        disconnectPeer,
        acceptConnection,
        rejectConnection,
        retryConnection,
        username,
        setUsername,
        sendZip
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
        analytics.trackPageView('/');
    }, []);

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

            <AnimatePresence>
                {pendingConnections.map((request) => (
                    <ConnectionRequest
                        key={request.id}
                        peerId={request.id}
                        username={request.username}
                        onAccept={() => acceptConnection(request.id)}
                        onReject={() => rejectConnection(request.id)}
                    />
                ))}
            </AnimatePresence>

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
                    {/* Left Sidebar: Identity & Controls */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Identity Card */}
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Your Identity</h2>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Online as <span className="font-medium text-foreground">{username || 'Guest'}</span>
                                        </p>
                                    </div>
                                    <Shield className="w-8 h-8 text-primary/20" />
                                </div>

                                <div className="relative group">
                                    <div
                                        onClick={handleCopyId}
                                        className="w-full bg-muted/40 border border-border rounded-lg p-3 pr-10 font-mono text-sm text-foreground break-all cursor-pointer hover:bg-muted/60 transition-colors"
                                    >
                                        {peerId}
                                    </div>
                                    <button
                                        onClick={handleCopyId}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <button
                                        onClick={() => setShowScanner(true)}
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border hover:bg-muted/50 hover:text-foreground text-muted-foreground transition-all text-sm font-medium"
                                    >
                                        <Scan className="w-4 h-4" />
                                        Scan QR
                                    </button>
                                    <button
                                        onClick={() => setShowQR(!showQR)}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border hover:bg-muted/50 hover:text-foreground text-muted-foreground transition-all text-sm font-medium ${showQR ? 'bg-muted' : ''}`}
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
                                            className="mt-6 flex justify-center bg-white p-4 rounded-lg border border-border"
                                        >
                                            <QRCodeSVG value={peerId} size={160} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Connection Status Card */}
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col h-full min-h-[200px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-foreground">Connections</h3>
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{connections.length}</span>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar">
                                <AnimatePresence>
                                    {connections.length > 0 ? (
                                        connections.map((connection) => (
                                            <motion.div
                                                key={connection.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/20 transition-all group"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                        {(connection.username || connection.id).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden leading-tight">
                                                        <span className="text-sm font-medium text-foreground truncate">{connection.username || 'Anonymous'}</span>
                                                        <span className="text-xs text-muted-foreground/80 font-mono truncate">{connection.id.substring(0, 8)}...</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => disconnectPeer(connection.id)}
                                                    className="text-muted-foreground hover:text-destructive p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Disconnect"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="h-32 flex flex-col items-center justify-center text-muted-foreground/60 text-center border-2 border-dashed border-border rounded-lg">
                                            <Users className="w-8 h-8 mb-2 opacity-50" />
                                            <p className="text-sm">No peers connected</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={handleConnect}
                                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Connect New Peer
                                </button>
                                {connections.length > 0 && (
                                    <button
                                        onClick={() => setShowChat(true)}
                                        className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg border border-border transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Open Chat
                                    </button>
                                )}
                            </div>
                        </div>
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
                        isOpen={showChat}
                        onClose={() => setShowChat(false)}
                        onClear={() => { }}
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
