
import React, { useCallback, useState } from 'react';
import { Share2, Upload, Users, X, QrCode, Scan, MessageSquare, Zap, Clock, Settings } from 'lucide-react';
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-950 text-slate-200 selection:bg-cyan-500/30 overflow-hidden relative"
        >
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#e2e8f0',
                        border: '1px solid rgba(255,255,255,0.1)',
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

            <div className="relative z-10 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen pb-20">
                {/* Header Section */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                            <Share2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
                                Sharencrypt
                            </h1>
                            <p className="text-slate-400 text-sm flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Secure P2P File Sharing
                                {username && <span className="text-cyan-400 font-mono ml-2">[{username}]</span>}
                            </p>
                        </div>

                        <div className="ml-4 flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowHistory(true)}
                                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"
                                title="Transfer History"
                            >
                                <Clock className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowSettings(true)}
                                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </motion.button>
                            <SoundToggle />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleConnect}
                            className="glass-button-primary flex-1 md:flex-none flex items-center justify-center gap-2"
                        >
                            <Users className="w-5 h-5" />
                            <span>Connect</span>
                        </motion.button>

                        <motion.label
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`glass-button flex-1 md:flex-none flex items-center justify-center gap-2 cursor-pointer ${connections.length > 0
                                ? 'bg-emerald-500/80 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
                                }`}
                        >
                            <Upload className="w-5 h-5" />
                            <span>Send File</span>
                            <input
                                type="file"
                                className="hidden"
                                multiple
                                onChange={handleFileSelect}
                                disabled={connections.length === 0}
                            />
                        </motion.label>
                    </div>
                </motion.div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">

                    {/* Left Column: ID & Peers */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="lg:col-span-1 space-y-6 flex flex-col"
                    >
                        {/* ID Card */}
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-20 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />

                            <h3 className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Your Identity</h3>
                            <div
                                onClick={() => { navigator.clipboard.writeText(peerId); }}
                                className="glass-input p-3 rounded-lg font-mono text-cyan-300 text-sm break-all cursor-pointer hover:bg-white/5 transition-colors flex justify-between items-center group/id"
                            >
                                {peerId}
                                <span className="opacity-0 group-hover/id:opacity-100 text-xs text-slate-500">Copy</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowScanner(true)}
                                    className="glass-button-secondary flex flex-col items-center justify-center py-3 gap-1 text-xs"
                                >
                                    <Scan className="w-5 h-5 text-purple-400" />
                                    <span>Scan QR</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowQR(!showQR)}
                                    className={`glass-button-secondary flex flex-col items-center justify-center py-3 gap-1 text-xs ${showQR ? 'bg-white/10' : ''}`}
                                >
                                    <QrCode className="w-5 h-5 text-blue-400" />
                                    <span>Show QR</span>
                                </motion.button>
                            </div>

                            <AnimatePresence>
                                {showQR && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-4 flex justify-center bg-white p-4 rounded-xl"
                                    >
                                        <QRCodeSVG value={peerId} size={180} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Connected Peers */}
                        <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Connected Peers</h3>
                                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full border border-slate-700">{connections.length}</span>
                            </div>

                            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar max-h-[300px] lg:max-h-none">
                                <AnimatePresence>
                                    {connections.length > 0 ? (
                                        connections.map((connection) => (
                                            <motion.div
                                                key={connection.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-900 font-bold text-xs shrink-0">
                                                        {(connection.username || connection.id).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="text-sm text-slate-200 font-medium truncate">
                                                            {connection.username || 'Anonymous Peer'}
                                                        </span>
                                                        <span className="text-xs text-slate-500 font-mono truncate">
                                                            {connection.id.substring(0, 12)}...
                                                        </span>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => disconnectPeer(connection.id)}
                                                    className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </motion.button>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-center text-sm p-4 border border-dashed border-slate-700 rounded-xl">
                                            <Zap className="w-8 h-8 mb-2 opacity-50" />
                                            <p>No connections active</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {connections.length > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowChat(true)}
                                    className="mt-4 w-full glass-button-secondary flex items-center justify-center gap-2 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Chat with Peers
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column: Files */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col min-h-[500px]"
                    >
                        <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                            File Transfers
                        </h2>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {files.length > 0 ? (
                                <FileList files={files} />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                                    <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Share2 className="w-10 h-10" />
                                    </div>
                                    <p className="text-lg font-medium">Ready to share</p>
                                    <p className="text-sm">Connect to a peer to start transferring files securely.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

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

            <AnimatePresence>
                {showSettings && (
                    <SettingsDialog
                        isOpen={showSettings}
                        onClose={() => setShowSettings(false)}
                        currentPeerId={peerId}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
