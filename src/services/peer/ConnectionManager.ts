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
            toast.success('Ready for P2P connections!');
            this.emit('ready', { peerId: id });
        });

        this.peer.on('connection', (conn) => {
            console.log('Incoming connection from:', conn.peer);
            this.pendingConnections.set(conn.peer, conn);

            conn.on('open', () => {
                console.log('Pending connection opened from:', conn.peer);
            });

            conn.on('close', () => {
                console.log('Pending connection closed:', conn.peer);
                this.pendingConnections.delete(conn.peer);
            });

            const username = conn.metadata?.username;
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

        try {
            this.connectionStatus = 'connecting';
            toast.loading('Establishing P2P connection...', { id: 'connecting' });

            const conn = this.peer.connect(targetPeerId, {
                reliable: true,
                serialization: 'binary',
                metadata: {
                    username: this.username
                }
            });

            return new Promise((resolve) => {
                let timeout = setTimeout(() => {
                    toast.dismiss('connecting');
                    toast.error('Connection timeout');
                    this.connectionStatus = 'failed';
                    resolve(false);
                }, 45000);

                conn.on('open', () => {
                    clearTimeout(timeout);
                    toast.dismiss('connecting');
                    console.log('Connection opened, initiating handshake...');

                    this.connections.set(targetPeerId, conn);
                    // Emit internal event so TransferManager can listen
                    this.emit('new-connection', { peerId: targetPeerId, conn });

                    this.setupDataListeners(conn, targetPeerId);

                    // Handshake
                    this.sendHandshake(conn, targetPeerId);

                    // Wait for handshake response
                    const handshakeTimeout = setTimeout(() => {
                        // toast.error('Handshake timeout');
                    }, 5000);

                    const handshakeHandler = (data: DeviceInfo) => {
                        if (data.peerId === targetPeerId) {
                            clearTimeout(handshakeTimeout);
                            const deviceInfo = this.peerDeviceInfo.get(targetPeerId);
                            const peerName = deviceInfo ? deviceInfo.deviceName : targetPeerId.substring(0, 8);

                            toast.success(`Connected to ${peerName}`);
                            playSound('success');

                            this.connectionStatus = 'connected';
                            this.emit('connection', { peerId: targetPeerId, deviceInfo });
                            this.off('handshake-complete', handshakeHandler);
                            resolve(true);
                        }
                    };
                    this.on('handshake-complete', handshakeHandler);
                });

                conn.on('error', (error) => {
                    clearTimeout(timeout);
                    toast.dismiss('connecting');
                    console.error('Connection error:', error);
                    toast.error('Failed to connect');
                    this.connectionStatus = 'failed';
                    resolve(false);
                });

                conn.on('close', () => {
                    if (this.connectionStatus === 'connecting') {
                        clearTimeout(timeout);
                        toast.dismiss('connecting');
                        toast.error('Connection closed unexpectedly');
                        this.connectionStatus = 'failed';
                        resolve(false);
                    }
                });
            });

        } catch (error) {
            toast.dismiss('connecting');
            console.error('Connect error:', error);
            toast.error('Failed to connect');
            this.connectionStatus = 'failed';
            return false;
        }
    }

    public acceptConnection(peerId: string): void {
        const conn = this.pendingConnections.get(peerId);
        if (!conn) return;

        console.log('Accepting connection from:', peerId);
        this.pendingConnections.delete(peerId);
        this.connections.set(peerId, conn);

        this.setupDataListeners(conn, peerId);
        this.emit('new-connection', { peerId, conn });

        const initiateHandshake = () => {
            this.sendHandshake(conn, peerId);
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

        const handshakeHandler = (data: DeviceInfo) => {
            if (data.peerId === peerId) {
                toast.dismiss('accepting');
                toast.success(`Connected!`);
                this.emit('connection', { peerId, deviceInfo: this.peerDeviceInfo.get(peerId) });
                this.off('handshake-complete', handshakeHandler);
            }
        };
        this.on('handshake-complete', handshakeHandler);
    }

    public rejectConnection(peerId: string): void {
        const conn = this.pendingConnections.get(peerId);
        if (conn) {
            conn.close();
            this.pendingConnections.delete(peerId);
            toast.success('Connection rejected');
        }
    }

    public disconnectPeer(peerId: string): void {
        const conn = this.connections.get(peerId);
        if (conn) {
            conn.close();
        }
        this.connections.delete(peerId);
        this.peerDeviceInfo.delete(peerId);
        this.emit('disconnection', { peerId });
        toast.success('Disconnected');
    }

    private sendHandshake(conn: DataConnection, peerId: string): void {
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
                    // Reply
                    conn.send({
                        type: 'handshake-response',
                        payload: this.getDeviceInfo()
                    });
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
