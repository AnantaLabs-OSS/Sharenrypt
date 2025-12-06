import toast from 'react-hot-toast';
import { DataConnection } from 'peerjs';
import { FileTransfer } from '../../types';
import { Encryption } from '../../utils/encryption';
import { transferManager } from '../transferManager';
import { playSound } from '../../utils/sounds';
import { ConnectionManager } from './ConnectionManager';

export interface FileHandlerEvents {
    emit(event: string, data: any): void;
}

export class FileHandler {
    private incomingTransfers: Map<string, any> = new Map();
    private transferStatusListeners: Map<string, (offset: number) => void> = new Map();
    private service: FileHandlerEvents;
    private connectionManager: ConnectionManager;

    constructor(service: FileHandlerEvents, connectionManager: ConnectionManager) {
        this.service = service;
        this.connectionManager = connectionManager;
    }

    // --- Resume Logic ---

    public async waitForResumeOffset(transferId: string): Promise<number> {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                this.transferStatusListeners.delete(transferId);
                resolve(0); // Default to 0 if no response
            }, 5000);

            this.transferStatusListeners.set(transferId, (offset) => {
                clearTimeout(timeout);
                this.transferStatusListeners.delete(transferId);
                resolve(offset);
            });
        });
    }

    public handleTransferQuery(payload: { id: string }, peerId: string): void {
        transferManager.getLastChunkOffset(payload.id).then((offset) => {
            const conn = this.connectionManager.getConnection(peerId);
            if (conn && conn.open) {
                conn.send({
                    type: 'transfer-status',
                    payload: { id: payload.id, offset }
                });
            }
        });
    }

    public handleTransferStatus(payload: { id: string, offset: number }): void {
        const listener = this.transferStatusListeners.get(payload.id);
        if (listener) {
            listener(payload.offset);
        }
    }

    // --- File Sending ---

    public async sendFile(targetPeerId: string, file: File): Promise<void> {
        const conn = this.connectionManager.getConnection(targetPeerId);
        if (!conn || !conn.open) {
            toast.error('Not connected to peer');
            throw new Error('Not connected');
        }

        try {
            toast.loading('Preparing encryption...', { id: 'encrypting' });
            const cryptoKey = await Encryption.generateKey();
            const keyStr = await Encryption.exportKey(cryptoKey);

            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const transferId = `${safeName}-${file.size}`;

            toast.dismiss('encrypting');

            // Check for resume
            conn.send({ type: 'transfer-query', payload: { id: transferId } });
            const startOffset = await this.waitForResumeOffset(transferId);

            if (startOffset > 0) {
                toast.success(`Resuming from ${Math.round(startOffset / 1024)}KB`);
            }

            const transfer: FileTransfer = {
                id: transferId,
                name: file.name,
                size: file.size,
                type: file.type,
                progress: Math.round((startOffset / file.size) * 100),
                status: 'pending',
                startTime: Date.now(),
                speed: 0,
                eta: 0
            };
            this.service.emit('file-progress', { ...transfer });

            conn.send({
                type: 'file-start',
                payload: {
                    id: transferId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    key: keyStr,
                },
            });

            toast.loading(startOffset > 0 ? `Resuming ${file.name}...` : `Sending ${file.name}...`, { id: transferId });

            const worker = new Worker(new URL('../../workers/encryption.worker.ts', import.meta.url), { type: 'module' });

            // Dynamic Chunk Optimization
            let chunkSize = 16 * 1024; // Start with 16KB
            const MAX_CHUNK_SIZE = 256 * 1024; // Max 256KB
            const MIN_CHUNK_SIZE = 16 * 1024;

            const encryptChunk = (chunk: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> => {
                return new Promise((resolve, reject) => {
                    const handler = (e: MessageEvent) => {
                        if (e.data.type === 'encrypt-success') {
                            worker.removeEventListener('message', handler);
                            resolve(e.data.payload.encrypted);
                        } else if (e.data.type === 'error') {
                            worker.removeEventListener('message', handler);
                            reject(e.data.payload.error);
                        }
                    };
                    worker.addEventListener('message', handler);
                    worker.postMessage({ type: 'encrypt', payload: { chunk, key, iv } });
                });
            };

            let offset = startOffset;

            while (offset < file.size) {
                const chunkStartTime = Date.now();

                // Read chunk manually
                const end = Math.min(offset + chunkSize, file.size);
                const chunkBlob = file.slice(offset, end);
                const chunkBuffer = await chunkBlob.arrayBuffer();

                const currentConn = conn as any;
                // Backpressure check
                while (currentConn.bufferedAmount > chunkSize * 2) {
                    await new Promise(r => setTimeout(r, 50));
                }

                const chunkIv = window.crypto.getRandomValues(new Uint8Array(12));
                const encryptedChunk = await encryptChunk(chunkBuffer, cryptoKey, chunkIv);

                conn.send({
                    type: 'file-chunk',
                    payload: {
                        id: transferId,
                        chunk: encryptedChunk,
                        iv: btoa(String.fromCharCode(...chunkIv)),
                        offset,
                        totalSize: file.size,
                    },
                });

                offset += chunkBuffer.byteLength;

                // Dynamic Size Adjustment
                const chunkDuration = Date.now() - chunkStartTime;
                if (chunkDuration < 50) {
                    chunkSize = Math.min(chunkSize * 2, MAX_CHUNK_SIZE);
                } else if (chunkDuration > 200) {
                    chunkSize = Math.max(chunkSize / 2, MIN_CHUNK_SIZE);
                }

                // Stats
                const now = Date.now();
                const elapsed = (now - (transfer.startTime || now)) / 1000;
                const sessionBytes = offset - startOffset;
                const speed = elapsed > 0 ? sessionBytes / elapsed : 0;
                const progress = Math.round((offset / file.size) * 100);
                const eta = speed > 0 ? Math.ceil((file.size - offset) / speed) : 0;

                this.service.emit('file-progress', {
                    ...transfer, progress, status: 'encrypting', speed, eta
                });
            }

            worker.terminate();

            conn.send({ type: 'file-complete', payload: { id: transferId } });

            toast.dismiss(transferId);
            toast.success('File sent successfully!');
            playSound('success');

            transfer.status = 'completed';
            transfer.progress = 100;
            this.service.emit('file-sent', { ...transfer });

        } catch (error) {
            console.error('File send error:', error);
            toast.dismiss('encrypting');
            toast.error('Failed to send file');
            this.service.emit('error', { error });
            throw error;
        }
    }

    // --- Incoming Data Handling ---

    public async handleFileStart(metadata: any): Promise<void> {
        try {
            const cryptoKey = await Encryption.importKey(metadata.key);
            const transfer: FileTransfer = {
                id: metadata.id,
                name: metadata.name,
                size: metadata.size,
                type: metadata.type,
                progress: 0,
                status: 'pending',
                startTime: Date.now(),
                speed: 0,
                eta: 0
            };

            const existing = await transferManager.getTransfer(metadata.id);
            if (existing) {
                toast.success(`Resuming ${metadata.name}...`);
            } else {
                await transferManager.saveTransferMetadata({
                    id: metadata.id,
                    name: metadata.name,
                    size: metadata.size,
                    type: metadata.type,
                    key: metadata.key,
                    iv: metadata.iv,
                    totalChunks: 0
                });
                toast.loading(`Receiving ${metadata.name}...`, { id: metadata.id });
            }

            this.incomingTransfers.set(metadata.id, {
                ...metadata,
                chunks: [],
                receivedSize: 0,
                cryptoKey,
                startTime: Date.now()
            });

            this.service.emit('file-incoming', transfer);
        } catch (e) {
            console.error("Failed to start file transfer:", e);
        }
    }

    public async handleFileChunk(data: any): Promise<void> {
        const transfer = this.incomingTransfers.get(data.id);
        if (!transfer) return;

        try {
            await transferManager.saveChunk(data.id, data.offset, data.chunk, data.iv);

            const bytesReceived = data.offset + data.chunk.byteLength;
            const progress = Math.round((bytesReceived / data.totalSize) * 100);

            const now = Date.now();
            const elapsed = (now - transfer.startTime) / 1000;
            const speed = elapsed > 0 ? bytesReceived / elapsed : 0;
            const remaining = data.totalSize - bytesReceived;
            const eta = speed > 0 ? Math.ceil(remaining / speed) : 0;

            this.service.emit('file-progress', {
                transfer: {
                    id: transfer.id,
                    name: transfer.name,
                    size: transfer.size,
                    type: transfer.type,
                    progress,
                    status: 'downloading',
                    speed,
                    eta
                },
            });
        } catch (e) {
            console.error("Chunk save failed", e);
        }
    }

    public async handleFileComplete(data: any): Promise<void> {
        let transfer = this.incomingTransfers.get(data.id);
        if (!transfer) {
            const meta = await transferManager.getTransfer(data.id);
            if (meta) {
                const cryptoKey = await Encryption.importKey(meta.key);
                transfer = { ...meta, cryptoKey, chunks: [] };
            } else {
                return;
            }
        }

        if (!transfer) return;

        try {
            toast.loading(`Finalizing ${transfer.name}...`, { id: data.id });

            const dbChunks = await transferManager.getChunks(data.id);
            dbChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

            const parts: ArrayBuffer[] = [];
            const cryptoKey = transfer.cryptoKey;

            for (const chunk of dbChunks) {
                const iv = Uint8Array.from(atob(chunk.iv), c => c.charCodeAt(0));
                const decrypted = await window.crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    cryptoKey!,
                    chunk.data
                );
                parts.push(decrypted);
            }

            const blob = new Blob(parts, { type: transfer.type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = transfer.name;
            a.click();
            URL.revokeObjectURL(url);

            await transferManager.deleteTransfer(data.id);
            this.incomingTransfers.delete(data.id);

            toast.dismiss(data.transferId);
            toast.dismiss(data.id);
            toast.success('File saved!');
            playSound('success');

            const fileTransfer: FileTransfer = {
                id: data.id,
                name: transfer.name,
                size: transfer.size,
                type: transfer.type,
                progress: 100,
                status: 'completed',
                speed: 0,
                eta: 0
            };

            this.service.emit('file-received', { ...fileTransfer });

        } catch (error) {
            console.error('Finalization error:', error);
            toast.dismiss(data.id);
            toast.error('Failed to save file');
        }
    }
}
