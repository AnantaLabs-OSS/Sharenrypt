import { EventEmitter } from '../utils/EventEmitter';
import { WasmService } from './wasmBridge';

declare global {
    interface Window {
        readChunk: (fileId: string, offset: number, size: number) => Promise<Uint8Array>;
    }
}

export class WasmPeerService extends EventEmitter {
    private static instance: WasmPeerService;
    private myPeerId: string = '';
    private username: string = '';
    private connections: any[] = [];
    private fileMap = new Map<string, File>();
    private receivingFiles = new Map<string, {
        chunks: Uint8Array[],
        totalSize: number,
        receivedSize: number,
        metadata: any,
        writable?: any,
        writeQueue?: Uint8Array[],
        isWriting?: boolean,
        startTime?: number,
        lastUpdateTime?: number,
        lastReceivedSize?: number
    }>();

    // Singleton pattern
    public static getInstance(): WasmPeerService {
        if (!WasmPeerService.instance) {
            WasmPeerService.instance = new WasmPeerService();
        }
        return WasmPeerService.instance;
    }

    constructor() {
        super();
        this.initialize();
    }

    private initialize() {
        // Expose readChunk for Wasm
        window.readChunk = async (fileId: string, offset: number, size: number) => {
            const file = this.fileMap.get(fileId);
            if (!file) {
                throw new Error(`File not found: ${fileId}`);
            }
            const blob = file.slice(offset, offset + size);
            const buffer = await blob.arrayBuffer();
            return new Uint8Array(buffer);
        };

        // Simple polling to wait for Wasm to be ready
        const checkWasm = () => {
            // Check if Wasm init function is available
            const result = WasmService.initPeer();

            if (result && result.success) {
                // Register JS Callbacks for Wasm events
                WasmService.setCallbacks({
                    onOpen: (id: string) => {
                        console.log('[WasmPeer] Ready:', id);
                        this.myPeerId = id;
                        this.emit('ready', { peerId: id });

                        // If username is already set, update Go
                        if (this.username) {
                            WasmService.setUsername(this.username);
                        }
                    },
                    onConnection: (info: { peer: string }) => {
                        console.log('[WasmPeer] Incoming Request:', info.peer);
                        // Emit request event for UI
                        this.emit('connection-request', { peerId: info.peer });
                    },
                    onConnectionOpened: (id: string) => {
                        console.log('[WasmPeer] Connection Open:', id);
                        if (!this.connections.find(c => c.id === id)) {
                            this.connections.push({ id: id, connected: true });
                        }
                        this.emit('connection', { peerId: id });
                    },
                    onIdentity: (peerId: string, username: string) => {
                        console.log('[WasmPeer] Identity:', peerId, username);
                        const conn = this.connections.find(c => c.id === peerId);
                        if (conn) {
                            conn.username = username;
                        }
                        this.emit('connection-update', { peerId, username });
                    },
                    onFileIncoming: async (peerId: string, meta: any) => {
                        console.log('[WasmPeer] File Incoming:', meta);
                        const fileId = meta.id || Date.now().toString();

                        let useDiskStreaming = false;

                        // Try File System Access API for large files (> 50MB)
                        if (meta.size > 50 * 1024 * 1024 && 'showSaveFilePicker' in window) {
                            try {
                                console.log('[WasmPeer] Large file - requesting save location');
                                const handle = await (window as any).showSaveFilePicker({
                                    suggestedName: meta.name,
                                    types: [{ description: 'All Files', accept: { '*/*': [] } }]
                                });

                                const writable = await handle.createWritable();
                                useDiskStreaming = true;

                                const now = Date.now();
                                this.receivingFiles.set(fileId, {
                                    chunks: [],
                                    totalSize: meta.size,
                                    receivedSize: 0,
                                    metadata: { ...meta, peerId: peerId },
                                    writable: writable,
                                    writeQueue: [],
                                    isWriting: false,
                                    startTime: now,
                                    lastUpdateTime: now,
                                    lastReceivedSize: 0
                                });

                                // Start background flush worker
                                this.startDiskFlushWorker(fileId);

                                console.log('[WasmPeer] Buffered disk streaming enabled');
                            } catch (err) {
                                console.warn('[WasmPeer] Disk streaming unavailable, using RAM:', err);
                                // Fall through to RAM-based receiving below
                            }
                        }

                        // Fallback or default: RAM-based receiving
                        if (!useDiskStreaming) {
                            console.log('[WasmPeer] Using RAM-based receiving');
                            const now = Date.now();
                            this.receivingFiles.set(fileId, {
                                chunks: [],
                                totalSize: meta.size,
                                receivedSize: 0,
                                metadata: { ...meta, peerId: peerId },
                                startTime: now,
                                lastUpdateTime: now,
                                lastReceivedSize: 0
                            });
                        }

                        // Always emit file-incoming event for UI
                        this.emit('file-incoming', {
                            id: fileId,
                            name: meta.name,
                            size: meta.size,
                            type: meta.type,
                            peerId: peerId,
                            progress: 0,
                            status: 'receiving',
                            direction: 'incoming'
                        });
                    },
                    onFileChunk: (fileId: string, chunkData: Uint8Array, progress: number) => {
                        console.log('[WasmPeer] File Chunk:', fileId, chunkData.length, 'Progress:', progress.toFixed(1) + '%');
                        // Use sender's progress instead of calculating locally
                        this.handleFileChunk(fileId, chunkData, progress);
                    },
                    onFileProgress: (fileId: string, progress: number) => {
                        console.log('[WasmPeer] File Progress:', fileId, progress);
                        this.emit('file-progress', {
                            id: fileId,
                            progress: progress,
                            status: 'sending'
                        });
                    },
                    onData: (peerId: string, data: any) => {
                        // Handle progress updates from receiver
                        if (data.type === 'PROGRESS_UPDATE' && data.payload) {
                            const { fileId, progress, speed, eta, received, total } = data.payload;
                            console.log('[WasmPeer] Progress Update from receiver:', fileId, progress.toFixed(1) + '%');

                            // Update sender's display with receiver's metrics
                            this.emit('file-progress', {
                                id: fileId,
                                progress: progress,
                                speed: speed,
                                eta: eta,
                                received: received,
                                total: total,
                                status: 'sending'
                            });
                        } else if (data.type === 'FILE_COMPLETE' && data.payload) {
                            // Receiver has finished downloading
                            const { fileId, name, size } = data.payload;
                            console.log('[WasmPeer] File complete on receiver:', name);

                            // Mark as completed on sender side
                            this.emit('file-received', {
                                id: fileId,
                                status: 'completed',
                                name: name,
                                size: size,
                                type: ''
                            });
                        } else {
                            // Regular text message
                            this.emit('message', { peerId, text: data, id: Date.now().toString() });
                        }
                    },
                    onDisconnected: (peerId: string) => {
                        this.connections = this.connections.filter(c => c.id !== peerId);
                        this.emit('disconnection', { peerId });
                    }
                });

                if (this.username) {
                    WasmService.setUsername(this.username);
                }

                return;
            }

            // Retry if not ready
            if (result?.error === 'Wasm not ready') {
                console.log('[WasmPeer] Waiting for Wasm...');
                setTimeout(checkWasm, 500);
                return;
            }

            console.error("Failed to init Wasm Peer:", result?.error);
        };

        checkWasm();
    }

    public getPeerId(): string {
        return this.myPeerId;
    }

    public setUsername(name: string): void {
        this.username = name;
        WasmService.setUsername(name);
    }

    public getUsername(): string {
        return this.username;
    }

    public connectToPeer(targetPeerId: string): Promise<boolean> {
        WasmService.connect(targetPeerId);
        return Promise.resolve(true);
    }

    public acceptConnection(peerId: string): void {
        // Auto-accepted by Wasm/PeerJS currently
        console.log('[WasmPeer] Accepting connection:', peerId);
    }

    public rejectConnection(peerId: string): void {
        console.log('[WasmPeer] Rejecting connection:', peerId);
        this.connections = this.connections.filter(c => c.id !== peerId);
    }

    public disconnectPeer(peerId: string): void {
        console.log('[WasmPeer] Disconnecting from:', peerId);
        this.connections = this.connections.filter(c => c.id !== peerId);
        this.emit('disconnection', { peerId });
        // No-op
    }

    public getConnections() {
        return this.connections;
    }

    public sendTextMessage(targetPeerId: string, text: string): string | null {
        WasmService.send(targetPeerId, text);
        return Date.now().toString();
    }

    public sendReadReceipt(targetPeerId: string, messageId: string): void {
        // No-op
    }

    public sendTypingStatus(targetPeerId: string, isTyping: boolean): void {
        // No-op
    }

    public sendFile(targetPeerId: string, file: File, startingOffset: number = 0): Promise<void> {
        console.log("Sending file via Wasm Control:", file.name);

        const fileId = Date.now().toString(); // Use timestamp as simple ID
        this.fileMap.set(fileId, file);

        // Notify UI of outgoing file
        this.emit('file-outgoing', {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            peerId: targetPeerId,
            progress: 0,
            status: 'sending',
            direction: 'outgoing'
        });

        // Send file metadata first
        WasmService.send(targetPeerId, {
            type: 'FILE_META',
            payload: {
                id: fileId,
                name: file.name,
                size: file.size,
                type: file.type
            }
        });

        // Trigger actual file transmission via Wasm
        console.log('[WasmPeer] Starting file transmission:', fileId);
        WasmService.startSend(fileId, targetPeerId, file.size);

        return Promise.resolve();
    }

    // Helper to trigger file download
    private triggerDownload(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Background worker to flush RAM buffer to disk
    private startDiskFlushWorker(fileId: string) {
        const flushInterval = setInterval(async () => {
            const fileTransfer = this.receivingFiles.get(fileId);

            // Stop if file completed or removed
            if (!fileTransfer || !fileTransfer.writable) {
                clearInterval(flushInterval);
                return;
            }

            // Skip if already writing or queue is empty
            if (fileTransfer.isWriting || !fileTransfer.writeQueue || fileTransfer.writeQueue.length === 0) {
                return;
            }

            fileTransfer.isWriting = true;

            try {
                // Batch drain buffer (take up to 100 chunks at a time)
                const batch = fileTransfer.writeQueue.splice(0, 100);

                // Write all chunks in batch
                for (const chunk of batch) {
                    await fileTransfer.writable.write(chunk);
                }

                // console.log(`[WasmPeer] Flushed ${batch.length} chunks to disk`);
            } catch (err) {
                console.error('[WasmPeer] Disk flush error:', err);
                this.emit('file-error', { id: fileId, error: String(err) });
                clearInterval(flushInterval);
            } finally {
                fileTransfer.isWriting = false;
            }
        }, 50); // Flush every 50ms
    }

    // Receive file chunks from Go and stream to disk or build blob
    public handleFileChunk(fileId: string, chunkData: Uint8Array, senderProgress: number) {
        const fileTransfer = this.receivingFiles.get(fileId);
        if (!fileTransfer) return;

        const now = Date.now();
        fileTransfer.receivedSize += chunkData.length;

        // Buffer to RAM queue (instant, no blocking!)
        if (fileTransfer.writeQueue) {
            fileTransfer.writeQueue.push(chunkData);
        } else {
            fileTransfer.chunks.push(chunkData);
        }

        // Calculate actual receiving stats
        const elapsedMs = now - (fileTransfer.startTime || now);
        const elapsedSec = elapsedMs / 1000;
        const percentage = (fileTransfer.receivedSize / fileTransfer.totalSize) * 100;

        // Speed: bytes per second (instantaneous from recent chunks)
        const timeDelta = now - (fileTransfer.lastUpdateTime || now);
        const bytesDelta = fileTransfer.receivedSize - (fileTransfer.lastReceivedSize || 0);
        const speed = timeDelta > 100 ? (bytesDelta / timeDelta) * 1000 : 0;

        // ETA: time remaining in seconds
        const remainingBytes = fileTransfer.totalSize - fileTransfer.receivedSize;
        const eta = speed > 0 ? remainingBytes / speed : 0;

        // Emit receiver's accurate progress with metrics
        this.emit('file-progress', {
            id: fileId,
            progress: percentage,
            speed: speed,  // bytes/sec
            eta: eta,      // seconds
            received: fileTransfer.receivedSize,
            total: fileTransfer.totalSize,
            status: 'receiving'
        });

        // Send progress update back to sender (throttled to every 100ms)
        if (timeDelta > 100 && fileTransfer.metadata?.peerId) {
            WasmService.send(fileTransfer.metadata.peerId, {
                type: 'PROGRESS_UPDATE',
                payload: {
                    fileId: fileId,
                    progress: percentage,
                    speed: speed,
                    eta: eta,
                    received: fileTransfer.receivedSize,
                    total: fileTransfer.totalSize
                }
            });
        }

        fileTransfer.lastUpdateTime = now;
        fileTransfer.lastReceivedSize = fileTransfer.receivedSize;

        // Check if complete
        if (fileTransfer.receivedSize >= fileTransfer.totalSize) {
            if ((fileTransfer as any).writable) {
                // Close disk stream (async, no wait needed)
                (fileTransfer as any).writable.close().then(() => {
                    console.log('[WasmPeer] File saved to disk!');
                });
            } else {
                // Download blob
                const blob = new Blob(fileTransfer.chunks as BlobPart[], { type: fileTransfer.metadata.type });
                this.triggerDownload(blob, fileTransfer.metadata.name);
            }

            // Notify sender that file is complete
            if (fileTransfer.metadata?.peerId) {
                WasmService.send(fileTransfer.metadata.peerId, {
                    type: 'FILE_COMPLETE',
                    payload: {
                        fileId: fileId,
                        name: fileTransfer.metadata.name,
                        size: fileTransfer.totalSize
                    }
                });
            }

            this.emit('file-received', {
                id: fileId,
                status: 'completed',
                name: fileTransfer.metadata.name,
                size: fileTransfer.metadata.size,
                type: fileTransfer.metadata.type
            });

            this.receivingFiles.delete(fileId);
        }
    }

    public sendZip(targetPeerId: string, files: File[]): Promise<void> {
        console.log("Sending ZIP via Wasm Control");
        return Promise.resolve();
    }

    public resumeTransfer(peerId: string, file: File, lastOffset: number): void {
        // No-op
    }
}
