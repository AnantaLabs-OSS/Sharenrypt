import { EventEmitter } from '../../utils/EventEmitter';
import Peer, { DataConnection } from 'peerjs';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { playSound } from '../../utils/sounds';
import { settingsService } from '../../services/settingsService';

// Configuration
const ICE_SERVERS = [
    { urls: import.meta.env.VITE_STUN_SERVER_1 || 'stun:stun.l.google.com:19302' },
    { urls: import.meta.env.VITE_STUN_SERVER_2 || 'stun:global.stun.twilio.com:3478' },
    { urls: import.meta.env.VITE_STUN_SERVER_3 || 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    {
        urls: import.meta.env.VITE_TURN_SERVER || 'turn:openrelay.metered.ca:80',
        username: import.meta.env.VITE_TURN_USERNAME || 'openrelayproject',
        credential: import.meta.env.VITE_TURN_CREDENTIAL || 'openrelayproject',
    },
].filter(server => server.urls);

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'failed';

import { DeviceInfo, SignalingMessage } from '../../types';

export class ConnectionManager extends EventEmitter {
    private peer: Peer | null = null;
    private peerId: string = '';
    private username: string = '';
    private connections: Map<string, DataConnection> = new Map();
    private pendingConnections: Map<string, DataConnection> = new Map();
    private connectionStatus: ConnectionStatus = 'idle';
    private peerDeviceInfo: Map<string, DeviceInfo> = new Map();

    constructor() {
        super();
        this.initializePeer();
    }



    private initializePeer(): void {
        try {
            // Check for saved Peer ID
            const savedId = settingsService.getSavedPeerId();
            this.peerId = savedId || nanoid();

            // Merge default ICE servers with custom user servers
            // Merge default ICE servers with custom user servers
            const customIceServers = settingsService.getIceServers();
            const combiniceServers = [...ICE_SERVERS, ...customIceServers];

            const signalingConfig = settingsService.getSignalingServer();
            const peerConfig: any = {
                debug: 2,
                config: {
                    iceServers: combiniceServers,
                    iceCandidatePoolSize: 10,
                },
            };

            if (signalingConfig && signalingConfig.enabled) {
                console.log('Using custom signaling server:', signalingConfig);
                peerConfig.host = signalingConfig.host;
                peerConfig.port = signalingConfig.port;
                peerConfig.path = signalingConfig.path;
                peerConfig.secure = signalingConfig.secure;
            } else {
                peerConfig.host = import.meta.env.VITE_PEER_HOST || '0.peerjs.com';
                peerConfig.port = Number(import.meta.env.VITE_PEER_PORT) || 443;
                peerConfig.path = import.meta.env.VITE_PEER_PATH || '/';
                peerConfig.secure = import.meta.env.VITE_PEER_SECURE !== 'false';
            }

            this.peer = new Peer(this.peerId, peerConfig);



            this.setupPeerEvents();
        } catch (error: any) {
            console.error('Failed to initialize PeerJS:', error);
            toast.error('Failed to connect to P2P network');
            this.emit('error', error);
        }
    }

    private setupPeerEvents(): void {
        if (!this.peer) return;

        this.peer.on('open', (id) => {
            console.log('Connected to PeerJS network with ID:', id);
            this.peerId = id;
            settingsService.savePeerId(id); // Persist ID
            toast.success('Ready for P2P connections!');
            this.emit('ready', { peerId: id });
        });

        this.peer.on('connection', (conn) => {
            console.log('Incoming connection from:', conn.peer);

            // Check for existing connection (reconnection attempt)
            if (this.connections.has(conn.peer)) {
                console.log('Already connected to', conn.peer, 'closing old connection');
                const oldConn = this.connections.get(conn.peer);
                if (oldConn) {
                    oldConn.close();
                    this.connections.delete(conn.peer);
                    this.peerDeviceInfo.delete(conn.peer);
                    this.emit('disconnection', { peerId: conn.peer });
                }
            }

            // Cleanup any existing pending request from same peer
            if (this.pendingConnections.has(conn.peer)) {
                console.log('Replacing pending connection from', conn.peer);
                const oldPending = this.pendingConnections.get(conn.peer);
                if (oldPending) oldPending.close();
                this.pendingConnections.delete(conn.peer);
            }

            this.pendingConnections.set(conn.peer, conn);

            conn.on('open', () => {
                console.log('Pending connection opened from:', conn.peer);
            });

            conn.on('close', () => {
                console.log('Pending connection closed:', conn.peer);
                this.pendingConnections.delete(conn.peer);
            });

            const username = conn.metadata?.username;

            // Attach data listeners immediately to capture handshake
            this.setupDataListeners(conn, conn.peer);

            console.log('MANAGER: Emitting connection-request event for:', conn.peer);
            this.emit('connection-request', {
                peerId: conn.peer,
                username
            });
        });

        this.peer.on('error', (error: any) => {
            console.error('PeerJS error:', error);
            if (error.type === 'peer-unavailable') {
                toast.error('Peer not found or offline');
                this.connectionStatus = 'failed';
            } else if (error.type === 'network') {
                toast.error('Network connection failed');
            } else {
                toast.error('Connection error: ' + error.message);
            }
            this.emit('error', { error });
        });

        this.peer.on('disconnected', () => {
            console.log('Disconnected from PeerJS network');
            toast.error('Disconnected from P2P network');
            this.emit('disconnected', {});
        });
    }

    public getPeerId(): string {
        return this.peerId;
    }

    public isSignalingConnected(): boolean {
        return !!this.peer && this.peer.open;
    }

    public setUsername(name: string): void {
        this.username = name;
    }

    public getUsername(): string {
        return this.username;
    }

    public getConnections(): Array<{ id: string; connected: boolean; username?: string }> {
        const connections: Array<{ id: string; connected: boolean; username?: string }> = [];
        this.connections.forEach((conn, peerId) => {
            const info = this.peerDeviceInfo.get(peerId);
            connections.push({
                id: peerId,
                connected: conn.open,
                username: info?.username
            });
        });
        return connections;
    }

    public getConnection(peerId: string): DataConnection | undefined {
        return this.connections.get(peerId);
    }

    public getPendingConnections(): string[] {
        return Array.from(this.pendingConnections.keys());
    }

    public getConnectionStatus(): ConnectionStatus {
        return this.connectionStatus;
    }

    private getDeviceInfo(): DeviceInfo {
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        return {
            peerId: this.peerId,
            deviceName: `${browser} on ${navigator.platform}`,
            username: this.username || undefined,
            browser,
            timestamp: Date.now(),
        };
    }

    private cancelledAttempts: Set<string> = new Set();

    public async connectToPeer(targetPeerId: string): Promise<boolean> {
        if (!this.peer) {
            toast.error('P2P network not initialized');
            return false;
        }

        if (targetPeerId === this.peerId) {
            toast.error('Cannot connect to yourself!');
            return false;
        }

        if (this.connections.has(targetPeerId)) {
            toast.error('Already connected to this peer');
            return false;
        }

        // Reset cancellation state for this peer
        this.cancelledAttempts.delete(targetPeerId);

        this.connectionStatus = 'connecting';
        toast.loading('Establishing P2P connection...', { id: 'connecting' });

        const MAX_RETRIES = 5;
        let attempt = 0;
        let rejected = false;

        while (attempt < MAX_RETRIES && !this.connections.has(targetPeerId) && !rejected) {
            // Check for cancellation
            if (this.cancelledAttempts.has(targetPeerId)) {
                console.log(`Connection attempt to ${targetPeerId} was cancelled by user.`);
                toast.dismiss('connecting');
                this.connectionStatus = 'idle'; // Reset status
                return false;
            }

            attempt++;
            if (attempt > 1) {
                console.log(`Retrying connection to ${targetPeerId} (Attempt ${attempt}/${MAX_RETRIES})`);
                toast.loading(`Connection attempt ${attempt}/${MAX_RETRIES}...`, { id: 'connecting' });
            }

            const success = await this.attemptConnection(targetPeerId, (isRejected) => {
                if (isRejected) {
                    rejected = true;
                }
            });

            if (success) {
                toast.dismiss('connecting');
                return true;
            }

            // Check for cancellation again after attempt
            if (this.cancelledAttempts.has(targetPeerId)) {
                console.log(`Connection attempt to ${targetPeerId} was cancelled by user.`);
                toast.dismiss('connecting');
                this.connectionStatus = 'idle';
                return false;
            }

            // If rejected, break immediately
            if (rejected) {
                toast.dismiss('connecting');
                toast.error('Connection rejected by user');
                return false;
            }

            // Wait a bit before retrying
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, 1500));
            }
        }

        if (this.cancelledAttempts.has(targetPeerId)) {
            // Already handled
            return false;
        }

        toast.dismiss('connecting');
        toast.error('Failed to connect after multiple attempts');
        this.connectionStatus = 'failed';
        return false;
    }

    private async attemptConnection(targetPeerId: string, onReject: (rejected: boolean) => void): Promise<boolean> {
        try {
            const conn = this.peer!.connect(targetPeerId, {
                reliable: true,
                serialization: 'binary',
                metadata: {
                    username: this.username
                }
            });

            return new Promise((resolve) => {
                let handshakeTimeout: NodeJS.Timeout;
                let handshakeHandler: (data: DeviceInfo) => void;
                let rejectionHandler: (data: unknown) => void;

                // Cleanup helper
                const cleanup = () => {
                    clearTimeout(timeout);
                    clearTimeout(handshakeTimeout);
                    if (handshakeHandler) {
                        this.off('handshake-complete', handshakeHandler);
                    }
                    if (rejectionHandler) {
                        conn.off('data', rejectionHandler);
                    }
                };

                // Listen for rejection SPECIFICALLY on this connection
                rejectionHandler = (data: unknown) => {
                    const message = data as any;
                    if (message && message.type === 'connection-rejected') {
                        console.log('Received rejection signal');
                        cleanup();
                        onReject(true);
                        conn.close();
                        resolve(false);
                    }
                };
                conn.on('data', rejectionHandler);


                let timeout = setTimeout(() => {
                    cleanup();
                    // Don't toast here, allow retry loop to handle notifications
                    // toast.error('Connection timeout');
                    conn.close();
                    resolve(false);
                }, 15000); // Shorter timeout per attempt (15s)

                conn.on('open', () => {
                    clearTimeout(timeout);
                    console.log('Connection opened (attempt), seeking handshake...');

                    this.setupDataListeners(conn, targetPeerId);
                    this.sendHandshake(conn);

                    // Wait for handshake response
                    // If we get it, WE ARE GOOD.
                    // If we don't, we might eventually time out or be rejected.

                    handshakeHandler = (data: DeviceInfo) => {
                        if (data.peerId === targetPeerId) {
                            cleanup();
                            // Success!
                            this.connections.set(targetPeerId, conn);
                            this.emit('new-connection', { peerId: targetPeerId, conn });

                            const deviceInfo = this.peerDeviceInfo.get(targetPeerId);
                            const peerName = deviceInfo ? deviceInfo.deviceName : targetPeerId.substring(0, 8);

                            toast.success(`Connected to ${peerName}`);
                            playSound('success');

                            this.connectionStatus = 'connected';
                            this.emit('connection', { peerId: targetPeerId, deviceInfo });
                            resolve(true);
                        }
                    };
                    this.on('handshake-complete', handshakeHandler);

                    // Specific handshake timeout for this opened connection
                    handshakeTimeout = setTimeout(() => {
                        console.warn('Handshake timed out (connected but no data)');
                        // We resolve false to trigger a retry (maybe they didn't get our handshake?)
                        cleanup();
                        conn.close();
                        resolve(false);
                    }, 5000);
                });

                conn.on('error', (error) => {
                    cleanup();
                    console.error('Connection error (attempt):', error);
                    resolve(false);
                });

                conn.on('close', () => {
                    // If we are connecting, this is a failure
                    cleanup();
                    resolve(false);
                });
            });

        } catch (error) {
            console.error('Connect attempt error:', error);
            return false;
        }
    }

    public acceptConnection(peerId: string): void {
        const conn = this.pendingConnections.get(peerId);
        if (!conn) return;

        console.log('Accepting connection from:', peerId);
        this.pendingConnections.delete(peerId);
        this.connections.set(peerId, conn);

        // Listeners are already attached in 'connection' event
        this.emit('new-connection', { peerId, conn });

        const initiateHandshake = () => {
            this.sendHandshake(conn);
            toast.loading(`Accepting connection...`, { id: 'accepting' });
        };

        if (conn.open) {
            initiateHandshake();
        } else {
            console.log('Connection not yet open, waiting for open event...');
            conn.on('open', () => {
                console.log('Connection opened via accept, sending handshake...');
                initiateHandshake();
            });
        }

        // Check if we ALREADY have the handshake data (likely yes)
        if (this.peerDeviceInfo.has(peerId)) {
            console.log('Handshake already received for:', peerId);
            toast.dismiss('accepting');
            toast.success(`Connected!`);
            this.emit('connection', { peerId, deviceInfo: this.peerDeviceInfo.get(peerId) });
            return;
        }

        // Otherwise wait for it, but with a timeout fallback
        // This fixes the "Accept button not working" hang on iOS if handshake packet is lost/delayed
        let fallbackTimeout: NodeJS.Timeout;

        const handshakeHandler = (data: DeviceInfo) => {
            if (data.peerId === peerId) {
                clearTimeout(fallbackTimeout);
                toast.dismiss('accepting');
                toast.success(`Connected!`);
                this.emit('connection', { peerId, deviceInfo: this.peerDeviceInfo.get(peerId) });
                this.off('handshake-complete', handshakeHandler);
            }
        };
        this.on('handshake-complete', handshakeHandler);

        fallbackTimeout = setTimeout(() => {
            // CRITICAL CHECK: Only force success IF the connection is actually open
            if (conn.open) {
                console.warn('Handshake timed out during accept, forcing connection success');
                this.off('handshake-complete', handshakeHandler);
                toast.dismiss('accepting');
                toast.success('Connected (Handshake incomplete)');

                // Register basic info since we missed the handshake
                if (!this.peerDeviceInfo.has(peerId)) {
                    this.peerDeviceInfo.set(peerId, {
                        peerId,
                        deviceName: 'Unknown Device',
                        browser: 'Unknown',
                        timestamp: Date.now()
                    });
                }

                this.emit('connection', { peerId, deviceInfo: this.peerDeviceInfo.get(peerId) });
            } else {
                console.error('Handshake timed out and connection is NOT open. Aborting accept.');
                this.off('handshake-complete', handshakeHandler);
                toast.dismiss('accepting');
                toast.error('Connection failed (Not Open)');
                // Cleanup
                this.connections.delete(peerId);
                this.peerDeviceInfo.delete(peerId);
                this.emit('disconnection', { peerId });
            }
        }, 3000); // 3 second max wait
    }

    public rejectConnection(peerId: string): void {
        const conn = this.pendingConnections.get(peerId);
        if (conn) {
            // Try to send rejection message if open
            if (conn.open) {
                try {
                    conn.send({ type: 'connection-rejected' });
                } catch (e) {
                    console.error('Failed to send rejection message', e);
                }
            }
            // Close after short delay to ensure message sends? 
            // PeerJS is fast, but a small tick might help.
            setTimeout(() => {
                conn.close();
            }, 100);

            this.pendingConnections.delete(peerId);
            toast.success('Connection rejected');
        }
    }

    public disconnectPeer(peerId: string): void {
        // Mark as cancelled to stop any pending retry loops
        this.cancelledAttempts.add(peerId);

        const conn = this.connections.get(peerId);
        if (conn) {
            conn.close();
        }

        // Also clean up pending connections immediately
        const pending = this.pendingConnections.get(peerId);
        if (pending) {
            pending.close();
            this.pendingConnections.delete(peerId);
        }

        this.connections.delete(peerId);
        this.peerDeviceInfo.delete(peerId);
        this.emit('disconnection', { peerId });

        // Only show toast if it was a connected peer
        if (conn) {
            toast.success('Disconnected');
        }
    }

    private sendHandshake(conn: DataConnection): void {
        const deviceInfo = this.getDeviceInfo();
        conn.send({
            type: 'handshake',
            payload: deviceInfo,
        });
    }

    private setupDataListeners(conn: DataConnection, peerId: string): void {
        conn.on('data', (data: unknown) => {
            const message = data as SignalingMessage;
            if (message && typeof message === 'object' && message.type) {
                if (message.type === 'handshake') {
                    console.log('Received handshake from:', peerId, message.payload);
                    this.peerDeviceInfo.set(peerId, message.payload);

                    // Only auto-reply if we aren't pending acceptance (avoids race condition)
                    const isPending = this.pendingConnections.has(peerId);
                    if (!isPending) {
                        conn.send({
                            type: 'handshake-response',
                            payload: this.getDeviceInfo()
                        });
                    }

                    this.emit('handshake-complete', { peerId, deviceInfo: message.payload });
                } else if (message.type === 'handshake-response') {
                    console.log('Received handshake response:', peerId, message.payload);
                    this.peerDeviceInfo.set(peerId, message.payload);
                    this.emit('handshake-complete', { peerId, deviceInfo: message.payload });
                } else {
                    // Forward other data (files, chat)
                    this.emit('data', { peerId, data: message });
                }
            }
        });

        conn.on('close', () => {
            console.log('Connection closed:', peerId);
            this.connections.delete(peerId);
            this.pendingConnections.delete(peerId); // Clean up pending too
            this.peerDeviceInfo.delete(peerId);
            this.emit('disconnection', { peerId });
        });

        conn.on('error', (err) => {
            console.error('Connection error:', peerId, err);
        });
    }

    public destroy() {
        this.peer?.destroy();
        this.connections.clear();
        this.pendingConnections.clear();
    }
}
