import { EventEmitter } from '../../utils/EventEmitter';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { Encryption } from '../../utils/encryption';
import { playSound } from '../../utils/sounds';
import { FileTransfer, WakeLockSentinel, SignalingMessage, FileStartPayload, FileChunkPayload } from '../../types';
import { ConnectionManager } from './ConnectionManager';

export class TransferManager extends EventEmitter {
    private connectionManager: ConnectionManager;
    private incomingTransfers: Map<string, any> = new Map();
    private wakeLockSentinel: WakeLockSentinel | null = null;

    constructor(connectionManager: ConnectionManager) {
        super();
        this.connectionManager = connectionManager;
    }

    public async sendFile(targetPeerId: string, file: File, startingOffset: number = 0): Promise<void> {
        const stream = file.slice(startingOffset).stream();
        await this.streamAndSend(targetPeerId, stream, { name: file.name, size: file.size, type: file.type }, startingOffset);
    }

    public async sendZip(targetPeerId: string, files: File[]): Promise<void> {
        try {
            toast.loading("Preparing zip in background...", { id: 'zipping' });

            const worker = new Worker(new URL('../../workers/zip.worker.ts', import.meta.url), { type: 'module' });

            const result = await new Promise<{ stream: ReadableStream<Uint8Array>, size: number }>((resolve, reject) => {
                worker.onmessage = (e) => {
                    const { type, payload } = e.data;
                    if (type === 'zip-created') {
                        resolve(payload);
                    } else if (type === 'error') {
                        reject(new Error(payload.error));
                    }
                };
                worker.onerror = (e) => reject(e);

                // Post files to worker
                worker.postMessage({ type: 'create-zip', payload: { files } });
            });

            // We can terminate the worker immediately after getting the stream? 
            // No, the stream is pulled from the worker, so the worker might need to stay alive until stream starts?
            // Actually, with Transferable streams, the underlying source moves. But for client-zip, it might be generating on demand.
            // Safe bet: Terminate worker ONLY after stream ends. 
            // BUT TransferManager.streamAndSend doesn't accept a "cleanup" callback.
            // However, readable streams transferred from workers usually keep the worker port active until closed.
            // Let's rely on garbage collection or explicit terminate if we can. 
            // For now, we won't terminate 'worker' explicitly here because 'stream' depends on it? 
            // Actually, if we transferred the stream, it's detached. But client-zip is a generator.
            // Let's assume standard behavior: The worker needs to run while the stream is being read.
            // We can attach a 'close' listener to the stream implicitly by wrapping it?
            // Or just leave the worker to GC (it will terminate when the script ends if not held?). 
            // Actually, explicit termination is better. Let's wrap the stream? 
            // For simplicity in this step, I will let the worker live. The browser cleans up terminated workers.
            // Wait, if I don't terminate it, it leaks.
            // Solution: streamAndSend consumes the stream. I can't easily hook into its lifecycle easily without changing streamAndSend signature.
            // ALTERNATIVE: just let the worker run. It's one worker per zip. Ideally we terminate it.
            // Let's rely on the fact that once the stream is fully read (in streamAndSend), we are done.
            // I'll make a minor change to streamAndSend to clear it? No, too invasive.
            // I will use a simple "terminate on 10 minutes timeout" or rely on the fact that `client-zip` finishes quickly?
            // No, `client-zip` generates bytes AS YOU READ. So the worker MUST be alive during upload.
            // I will accept the minor leak risk (one worker per zip upload) or assume the user refreshes.
            // BETTER: Add a `onComplete` callback to streamAndSend?

            // Let's just use the worker for "preparation" if possible? No, it streams.
            // OK, I will modify `streamAndSend` to take an optional `onComplete` callback to terminate the worker.

            toast.dismiss('zipping');

            // Current User (Sender) Name
            const username = this.connectionManager.getUsername() || 'Anon';
            const safeUsername = username.replace(/[^a-zA-Z0-9._-]/g, '_');
            const now = new Date();
            const timestamp =
                now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, '0') +
                String(now.getDate()).padStart(2, '0') + '_' +
                String(now.getHours()).padStart(2, '0') +
                String(now.getMinutes()).padStart(2, '0') +
                String(now.getSeconds()).padStart(2, '0');

            let zipName = `${safeUsername}_${timestamp}.zip`;

            await this.streamAndSend(targetPeerId, result.stream, {
                name: zipName,
                size: result.size,
                type: 'application/zip'
            }, 0, () => worker.terminate()); // Passing terminate as callback

        } catch (e) {
            console.error("Zip error", e);
            toast.dismiss('zipping');
            toast.error("Failed to prepare zip");
        }
    }

    public resumeTransfer(peerId: string, file: File, lastOffset: number) {
        this.sendFile(peerId, file, lastOffset);
    }

    public sendTypingStatus(targetPeerId: string, isTyping: boolean): void {
        const conn = this.connectionManager.getConnection(targetPeerId);
        if (conn && conn.open) {
            conn.send({
                type: isTyping ? 'typing-start' : 'typing-end',
                payload: {}
            });
        }
    }

    public sendTextMessage(targetPeerId: string, text: string): string | null {
        const conn = this.connectionManager.getConnection(targetPeerId);
        if (!conn || !conn.open) {
            toast.error('Not connected');
            return null;
        }

        const id = nanoid();
        conn.send({
            type: 'text-message',
            payload: { id, text }
        });
        playSound('message'); // Play sent sound
        return id;
    }

    public sendReadReceipt(targetPeerId: string, messageId: string): void {
        const conn = this.connectionManager.getConnection(targetPeerId);
        if (conn && conn.open) {
            conn.send({
                type: 'message-read',
                payload: { messageId }
            });
        }
    }

    private async streamAndSend(
        targetPeerId: string,
        stream: ReadableStream<Uint8Array>,
        metadata: { name: string; size: number; type: string },
        startingOffset: number = 0,
        onComplete?: () => void
    ): Promise<void> {
        const conn = this.connectionManager.getConnection(targetPeerId);

        if (!conn) {
            toast.error('Not connected to peer');
            return;
        }

        if (!conn.open) {
            toast.error('Connection is not open');
            return;
        }

        const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 1073741824;
        if (metadata.size > MAX_FILE_SIZE) {
            toast.error(`File too large! Limit is ${(MAX_FILE_SIZE / 1024 / 1024 / 1024).toFixed(1)}GB`);
            return;
        }

        try {
            await this.requestWakeLock();

            toast.loading(startingOffset > 0 ? 'Resuming transfer...' : 'Preparing encryption...', { id: 'encrypting' });
            const cryptoKey = await Encryption.generateKey();
            const keyStr = await Encryption.exportKey(cryptoKey);
            const transferId = nanoid();

            toast.dismiss('encrypting');

            const transfer: FileTransfer = {
                id: transferId,
                name: metadata.name,
                size: metadata.size,
                type: metadata.type,
                progress: Math.round((startingOffset / metadata.size) * 100),
                status: 'pending',
                peerId: targetPeerId,
            };
            this.emit('file-outgoing', transfer);

            conn.send({
                type: startingOffset > 0 ? 'file-resume' : 'file-start',
                payload: {
                    id: transferId,
                    name: metadata.name,
                    size: metadata.size,
                    type: metadata.type,
                    key: keyStr,
                    offset: startingOffset
                },
            });

            toast.loading(`Sending ${metadata.name}...`, { id: transferId });

            const worker = new Worker(new URL('../../workers/encryption.worker.ts', import.meta.url), { type: 'module' });

            let offset = startingOffset;
            // const startTime = Date.now();

            const reader = stream.getReader();

            const currentConn = conn as any;
            const getBuffered = () => (currentConn.dataChannel?.bufferedAmount ?? currentConn.bufferedAmount ?? 0);

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

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                while (getBuffered() > 1024 * 1024) {
                    await new Promise(r => setTimeout(r, 10));
                }

                if (!this.connectionManager.getConnection(targetPeerId)) {
                    throw new Error('Connection lost');
                }

                const chunkIv = window.crypto.getRandomValues(new Uint8Array(12));
                const encryptedChunk = await encryptChunk(value.buffer as ArrayBuffer, cryptoKey, chunkIv);

                conn.send({
                    type: 'file-chunk',
                    payload: {
                        id: transferId,
                        chunk: encryptedChunk,
                        iv: btoa(String.fromCharCode(...chunkIv)),
                        offset,
                        totalSize: metadata.size,
                    },
                });

                offset += value.length;

                // Note: We disabled local emitted progress here in favor of receiver feedback
                // waiting for 'progress-sync' events from receiver
            }

            // Final Drain
            let drainRetries = 0;
            while (getBuffered() > 0 && drainRetries < 60) {
                await new Promise(r => setTimeout(r, 100));
                drainRetries++;
            }

            worker.terminate();
            this.releaseWakeLock();

            conn.send({
                type: 'file-complete',
                payload: { id: transferId },
            });

            toast.dismiss(transferId);
            toast.success('Sent! Waiting for confirmation...');

            transfer.status = 'waiting';
            transfer.progress = 100;
            this.emit('file-progress', transfer);

            if (onComplete) onComplete();
        } catch (error) {
            console.error('File send error:', error);
            toast.dismiss('encrypting');
            toast.error('Failed to send file');
            this.releaseWakeLock();
            this.emit('error', { error });
            if (onComplete) onComplete();
        }
    }

    public handleIncomingData(data: SignalingMessage, peerId: string): void {
        const message = data;
        switch (message.type) {
            case 'file-start':
                this.handleFileStart(message.payload, false, peerId);
                break;
            case 'file-resume':
                this.handleFileStart(message.payload, true, peerId);
                break;
            case 'file-chunk':
                this.handleFileChunk(message.payload, peerId);
                break;
            case 'file-complete':
                this.handleFileComplete(message.payload, peerId);
                break;
            case 'file-ack':
                this.emit('file-sent', { id: message.payload.id, status: 'completed' });
                toast.success('Peer confirmed receipt!');
                playSound('success');
                break;
            case 'text-message':
                this.emit('message', {
                    peerId,
                    text: message.payload.text,
                    id: message.payload.id
                });

                playSound('message'); // Play received sound
                break;
            case 'typing-start':
                this.emit('typing-start', { peerId });
                break;
            case 'typing-end':
                this.emit('typing-end', { peerId });
                break;
            case 'message-read':
                this.emit('message-read', {
                    peerId,
                    messageId: message.payload.messageId
                });
                break;
            case 'progress-sync':
                this.emit('file-progress', {
                    id: message.payload.id,
                    progress: message.payload.progress,
                    speed: message.payload.speed,
                    eta: message.payload.eta,
                    status: 'sending'
                });
                break;
        }
    }

    private async handleFileStart(metadata: FileStartPayload, isResume: boolean, peerId: string): Promise<void> {
        try {
            const cryptoKey = await Encryption.importKey(metadata.key);
            const transferData: any = {
                ...metadata,
                receivedSize: metadata.offset || 0,
                startTime: Date.now(),
                cryptoKey,
                chunks: [],
                peerId: peerId
            };

            this.incomingTransfers.set(metadata.id, transferData);

            // Re-emit with peerId for UI
            this.emit('file-incoming', {
                id: metadata.id,
                name: metadata.name,
                size: metadata.size,
                type: metadata.type,
                peerId: peerId,
                status: 'receiving',
                progress: 0
            });

            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: isResume ? `resume_${metadata.name}` : metadata.name,
                    });
                    transferData.fileHandle = handle;
                    transferData.writable = await handle.createWritable({ keepExistingData: isResume });

                    if (isResume && metadata.offset > 0) {
                        await transferData.writable.seek(metadata.offset);
                    }
                    toast.success(isResume ? 'Resuming to disk...' : 'Streaming from peer 🚀');
                } catch (err: any) {
                    if (err.name === 'AbortError') return;
                    console.warn('FileSystem API failed, using RAM fallback');
                }
            }
        } catch (error) {
            console.error('File start error:', error);
            toast.error('Failed to start file transfer');
        }
    }

    private async handleFileChunk(data: FileChunkPayload, peerId: string): Promise<void> {
        const transfer = this.incomingTransfers.get(data.id);
        if (!transfer || !transfer.cryptoKey) return;

        try {
            const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
            // Decrypt
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                transfer.cryptoKey,
                data.chunk
            );

            if (transfer.writable) {
                await transfer.writable.write(decrypted);
            } else {
                transfer.chunks.push(decrypted);
            }

            transfer.receivedSize += decrypted.byteLength;

            // Progress Calculation
            const progress = transfer.size > 0 ? Math.round((transfer.receivedSize / transfer.size) * 100) : 0;
            const elapsed = Math.max((Date.now() - transfer.startTime) / 1000, 0.001); // Avoid division by zero
            const speed = transfer.receivedSize / elapsed; // bytes/sec
            const remaining = transfer.size - transfer.receivedSize;
            const eta = (speed > 0 && remaining > 0) ? remaining / speed : 0;

            this.emit('file-progress', {
                id: transfer.id,
                progress,
                speed,
                eta,
                status: 'downloading',
            });

            // FEEDBACK: Send progress back to sender (Throttle: 500ms)
            const now = Date.now();
            if (!transfer.lastFeedbackTime || now - transfer.lastFeedbackTime > 500 || progress === 100) {
                transfer.lastFeedbackTime = now;
                const conn = this.connectionManager.getConnection(peerId);
                if (conn) {
                    conn.send({
                        type: 'progress-sync',
                        payload: {
                            id: transfer.id,
                            progress,
                            speed,
                            eta
                        }
                    });
                }
            }

        } catch (e) {
            console.error("Chunk decryption failed", e);
        }
    }

    private async handleFileComplete(data: { id: string }, peerId: string): Promise<void> {
        const transfer = this.incomingTransfers.get(data.id);
        if (!transfer) return;

        try {
            if (transfer.writable) {
                await transfer.writable.close();
            } else {
                // Combine Blob
                const blob = new Blob(transfer.chunks, { type: transfer.type });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = transfer.name;
                a.click();
                URL.revokeObjectURL(url);
                transfer.chunks = []; // clear memory
            }

            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            if (isIOS) {
                toast.success(`Saved to 'Files' app! Open Files app to view/save to Photos.`, { duration: 5000 });
            } else {
                toast.success(`Received ${transfer.name}!`);
            }
            playSound('success');

            this.emit('file-received', {
                id: transfer.id,
                status: 'completed',
                peerId: peerId
            });

            // Send Ack
            const conn = this.connectionManager.getConnection(peerId);
            if (conn) {
                conn.send({
                    type: 'file-ack',
                    payload: { id: transfer.id }
                });
            }

            this.incomingTransfers.delete(data.id);

        } catch (e) {
            console.error('File completion error:', e);
            toast.error('Failed to finalize file');
        }
    }

    private async requestWakeLock(): Promise<void> {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
            } catch (err) {
                console.warn('Wake Lock request failed:', err);
            }
        }
    }

    private async releaseWakeLock(): Promise<void> {
        if (this.wakeLockSentinel) {
            await this.wakeLockSentinel.release();
            this.wakeLockSentinel = null;
        }
    }
}
