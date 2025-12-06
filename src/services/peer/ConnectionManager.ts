import { DataConnection } from 'peerjs';
import toast from 'react-hot-toast';

export interface DeviceInfo {
    peerId: string;
    deviceName: string;
    browser: string;
    timestamp: number;
}

export interface ConnectionEvents {
    emit(event: string, data: any): void;
    getPeerId(): string;
    handleIncomingData(data: any, peerId: string): void;
}

export class ConnectionManager {
    private connections: Map<string, DataConnection> = new Map();
    private pendingConnections: Map<string, DataConnection> = new Map();
    private pendingDataHandlers: Map<string, (data: any) => void> = new Map();
    private pendingCloseHandlers: Map<string, () => void> = new Map();
    private pingIntervals: Map<string, any> = new Map();
    private latencies: Map<string, number> = new Map();
    private peerDeviceInfo: Map<string, DeviceInfo> = new Map();
    private service: ConnectionEvents;

    constructor(service: ConnectionEvents) {
        this.service = service;
    }

    // --- State Accessors ---

    public getConnections(): Map<string, DataConnection> {
        return this.connections;
    }

    public getPendingConnections(): Map<string, DataConnection> {
        return this.pendingConnections;
    }

    public getConnection(peerId: string): DataConnection | undefined {
        return this.connections.get(peerId);
    }

    public getLatency(peerId: string): number | undefined {
        return this.latencies.get(peerId);
    }

    // --- Connection Lifecycle ---

    public has(peerId: string): boolean {
        return this.connections.has(peerId);
    }

    public close(peerId: string): void {
        this.connections.get(peerId)?.close();
    }

    public addPending(conn: DataConnection): void {
        const peerId = conn.peer;

        // If we are already fully connected, we might want to reject or accept if it's a reconnection.
        // For now, if we have a live connection, we ignore the new one to prevent disruption.
        if (this.connections.has(peerId)) {
            const activeConn = this.connections.get(peerId);
            if (activeConn && activeConn.open) {
                console.log('Ignoring duplicate connection (already active) from:', peerId);
                return;
            } else {
                // If existing connection is dead, clean it up
                console.log('Replacing dead active connection with new one:', peerId);
                this.disconnect(peerId);
            }
        }

        // If we have a pending connection, we REPLACE it with the new one.
        // This handles cases where the first attempt failed/stalled but was not removed.
        if (this.pendingConnections.has(peerId)) {
            console.log('Replacing duplicate pending connection from:', peerId);
            const oldConn = this.pendingConnections.get(peerId);

            // Clean up old listeners
            const oldDataHandler = this.pendingDataHandlers.get(peerId);
            const oldCloseHandler = this.pendingCloseHandlers.get(peerId);
            if (oldDataHandler && oldConn) oldConn.off('data', oldDataHandler);
            if (oldCloseHandler && oldConn) oldConn.off('close', oldCloseHandler);

            this.pendingDataHandlers.delete(peerId);
            this.pendingCloseHandlers.delete(peerId);

            if (oldConn) oldConn.close();
        }

        console.log('Incoming connection from:', peerId);
        this.pendingConnections.set(peerId, conn);
        this.service.emit('connection-request', { peerId });

        const openHandler = () => {
            console.log('Pending connection opened from:', peerId);
        };

        const closeHandler = () => {
            console.log('Pending connection closed:', peerId);
            this.pendingConnections.delete(peerId);
            this.service.emit('disconnected', { peerId });
            // Cleanup references
            this.pendingDataHandlers.delete(peerId);
            this.pendingCloseHandlers.delete(peerId);
        };

        const dataHandler = (data: any) => {
            if (data && typeof data === 'object' && (data as any).type === 'handshake') {
                this.handleHandshake((data as any).payload, peerId);
            }
        };

        this.pendingDataHandlers.set(peerId, dataHandler);
        this.pendingCloseHandlers.set(peerId, closeHandler);

        conn.on('open', openHandler);
        conn.on('close', closeHandler);
        conn.on('data', dataHandler);
    }

    public accept(targetPeerId: string): void {
        const conn = this.pendingConnections.get(targetPeerId);
        if (conn) {
            this.pendingConnections.delete(targetPeerId);

            // Targeted cleanup
            const dataHandler = this.pendingDataHandlers.get(targetPeerId);
            const closeHandler = this.pendingCloseHandlers.get(targetPeerId);

            if (dataHandler) {
                conn.off('data', dataHandler);
                this.pendingDataHandlers.delete(targetPeerId);
            }
            if (closeHandler) {
                conn.off('close', closeHandler);
                this.pendingCloseHandlers.delete(targetPeerId);
            }

            conn.off('open', () => { }); // Anonymous, but open likely fired already.

            this.setupConnectionEvents(conn, true);
        }
    }

    public reject(targetPeerId: string): void {
        const conn = this.pendingConnections.get(targetPeerId);
        if (conn) {
            conn.close();
            this.pendingConnections.delete(targetPeerId);
        }
    }

    public disconnect(peerId: string): void {
        const conn = this.connections.get(peerId);
        if (conn) {
            conn.close();
            this.connections.delete(peerId);
            this.service.emit('disconnected', { peerId });
        }
    }

    public setupConnectionEvents(conn: DataConnection, isAccepted: boolean = false): void {
        const onOpen = () => {
            console.log('Connection open with:', conn.peer);
            this.connections.set(conn.peer, conn);

            // If we manually accepted the connection (Receiver), we are "Connected" immediately.
            // If we are the Sender, we must WAIT for the handshake/response.
            if (isAccepted) {
                this.service.emit('connected', { peerId: conn.peer });
            }

            this.startPing(conn.peer);
            this.sendHandshake(conn.peer);
        };

        if (conn.open) {
            onOpen();
        } else {
            conn.on('open', onOpen);
        }

        conn.on('data', (data) => {
            console.log('Data received from:', conn.peer, data);
            this.service.handleIncomingData(data, conn.peer);
        });

        conn.on('close', () => {
            console.log('Connection closed with:', conn.peer);
            this.connections.delete(conn.peer);
            this.stopPing(conn.peer);
            this.service.emit('disconnected', { peerId: conn.peer });
            toast('Peer disconnected', { icon: '🔌' });
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            this.service.emit('error', { error: err, peerId: conn.peer });
        });
    }

    // --- Handshake & Ping ---

    private sendHandshake(targetPeerId: string): void {
        const info: DeviceInfo = {
            peerId: this.service.getPeerId(),
            deviceName: this.getBrowserName(),
            browser: this.getBrowserName(),
            timestamp: Date.now()
        };

        const conn = this.connections.get(targetPeerId) || this.pendingConnections.get(targetPeerId);
        if (conn && conn.open) {
            conn.send({ type: 'handshake', payload: info });
        }
    }

    public handleHandshake(info: DeviceInfo, peerId: string): void {
        this.peerDeviceInfo.set(peerId, info);
        const conn = this.connections.get(peerId);

        // If we are pending, we do nothing (handled in addPending).
        // If we are in 'connections' (meaning we accepted or we initiated), we reply.

        if (conn && conn.open) {
            conn.send({
                type: 'handshake-response', payload: {
                    peerId: this.service.getPeerId(),
                    deviceName: this.getBrowserName(),
                    browser: this.getBrowserName(),
                    timestamp: Date.now()
                }
            });

            // If we are the receiver (accepted connection), we can mark fully connected now that we got a handshake
            // from the sender (verifying they are alive).
            // Emitting 'connected' here ensures we only show UI connected when we are sure.
            this.service.emit('connected', { peerId: conn.peer });
        }
    }

    public handleHandshakeResponse(info: DeviceInfo, peerId: string): void {
        this.peerDeviceInfo.set(peerId, info);
        console.log('Handshake verified with:', peerId);
        // SENDER logic: We sent handshake, got response. NOW we are connected.
        this.service.emit('connected', { peerId: peerId });
        toast.success('Connection verification successful');
    }

    private getBrowserName(): string {
        const agent = navigator.userAgent.toLowerCase();
        if (agent.indexOf('chrome') > -1 && !!(window as any).chrome) return 'Chrome';
        if (agent.indexOf('firefox') > -1) return 'Firefox';
        if (agent.indexOf('safari') > -1) return 'Safari';
        return 'Unknown';
    }

    private startPing(peerId: string): void {
        if (this.pingIntervals.has(peerId)) return;

        const interval = setInterval(() => {
            const conn = this.connections.get(peerId);
            if (conn && conn.open) {
                conn.send({ type: 'ping', payload: Date.now() });
            }
        }, 2000);

        this.pingIntervals.set(peerId, interval);
    }

    private stopPing(peerId: string): void {
        const interval = this.pingIntervals.get(peerId);
        if (interval) {
            clearInterval(interval);
            this.pingIntervals.delete(peerId);
        }
    }

    public handlePing(timestamp: number, peerId: string): void {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            conn.send({ type: 'pong', payload: timestamp });
        }
    }

    public handlePong(originalTimestamp: number, peerId: string): void {
        const latency = Date.now() - originalTimestamp;
        this.latencies.set(peerId, latency);
        this.service.emit('latency-update', { peerId, latency });
    }
}
