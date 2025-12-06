import Peer, { DataConnection } from 'peerjs';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { FileTransfer } from '../types';
import { Encryption } from '../utils/encryption';
import { playSound } from '../utils/sounds';

// Configuration from environment
const CHUNK_SIZE = Number(import.meta.env.VITE_CHUNK_SIZE) || 16384; // 16KB chunks
// const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 1073741824; // 1GB (Unused but good for ref)

// WebRTC ICE configuration
const ICE_SERVERS = [
  { urls: import.meta.env.VITE_STUN_SERVER_1 },
  { urls: import.meta.env.VITE_STUN_SERVER_2 },
  { urls: import.meta.env.VITE_STUN_SERVER_3 },
  {
    urls: import.meta.env.VITE_TURN_SERVER,
    username: import.meta.env.VITE_TURN_USERNAME || 'openrelayproject',
    credential: import.meta.env.VITE_TURN_CREDENTIAL || 'openrelayproject',
  },
];

// Connection status types
type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'failed';

// Message types for data channel
interface Message {
  type: string;
  payload: any;
}

// Device info for handshake
interface DeviceInfo {
  peerId: string;
  deviceName: string;
  browser: string;
  timestamp: number;
}

export class PeerService {
  private peer: Peer | null = null;
  private peerId: string = '';
  private connections: Map<string, DataConnection> = new Map();
  private pendingConnections: Map<string, DataConnection> = new Map();
  private connectionStatus: ConnectionStatus = 'idle';
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private incomingTransfers: Map<string, any> = new Map();
  private peerDeviceInfo: Map<string, DeviceInfo> = new Map();

  constructor() {
    this.initializePeer();
  }

  private initializePeer(): void {
    try {
      // Generate unique peer ID
      this.peerId = nanoid();

      // Initialize PeerJS with free cloud server
      this.peer = new Peer(this.peerId, {
        host: import.meta.env.VITE_PEER_HOST || '0.peerjs.com',
        port: Number(import.meta.env.VITE_PEER_PORT) || 443,
        path: import.meta.env.VITE_PEER_PATH || '/',
        secure: import.meta.env.VITE_PEER_SECURE !== 'false',
        config: {
          iceServers: ICE_SERVERS,
          iceCandidatePoolSize: 10,
        },
        debug: 2, // Set to 0 in production
      });

      this.setupPeerEvents();
    } catch (error: any) {
      console.error('Failed to initialize PeerJS:', error);
      toast.error('Failed to connect to P2P network');
    }
  }

  private setupPeerEvents(): void {
    if (!this.peer) return;

    // Handle successful connection to PeerJS server
    this.peer.on('open', (id) => {
      console.log('Connected to PeerJS network with ID:', id);
      this.peerId = id;
      toast.success('Ready for P2P connections!');
      this.emit('ready', { peerId: id });
    });

    // Handle incoming connections
    this.peer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);

      // Store the connection object for later acceptance
      this.pendingConnections.set(conn.peer, conn);
      this.emit('connection-request', { peerId: conn.peer });

      // Setup basic handlers but don't fully activate yet
      conn.on('open', () => {
        console.log('Pending connection opened from:', conn.peer);
      });

      conn.on('close', () => {
        console.log('Pending connection closed:', conn.peer);
        this.pendingConnections.delete(conn.peer);
      });
    });

    // Handle errors
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

    // Handle disconnection
    this.peer.on('disconnected', () => {
      console.log('Disconnected from PeerJS network');
      toast.error('Disconnected from P2P network');
      this.emit('disconnected', {});
    });
  }

  public getPeerId(): string {
    return this.peerId;
  }

  public getConnections(): Array<{ id: string; connected: boolean }> {
    const connections: Array<{ id: string; connected: boolean }> = [];

    this.connections.forEach((conn, peerId) => {
      connections.push({
        id: peerId,
        connected: conn.open,
      });
    });

    return connections;
  }

  public getPendingConnections(): string[] {
    return Array.from(this.pendingConnections.keys());
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // Helper to get device info
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';

    if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    const deviceName = `${browser} on ${navigator.platform}`;

    return {
      peerId: this.peerId,
      deviceName,
      browser,
      timestamp: Date.now(),
    };
  }

  // Handshake methods
  private sendHandshake(conn: DataConnection, peerId: string): void {
    console.log('Sending handshake to:', peerId);
    const deviceInfo = this.getDeviceInfo();

    conn.send({
      type: 'handshake',
      payload: deviceInfo,
    });
  }

  private handleHandshake(deviceInfo: DeviceInfo, peerId: string): void {
    console.log('Received handshake from:', peerId, deviceInfo);

    // Store peer's device info
    this.peerDeviceInfo.set(peerId, deviceInfo);

    // Send handshake response
    const conn = this.connections.get(peerId);
    if (conn) {
      const myDeviceInfo = this.getDeviceInfo();
      conn.send({
        type: 'handshake-response',
        payload: myDeviceInfo,
      });

      // Emit handshake complete
      this.emit('handshake-complete', { peerId, deviceInfo });
      console.log('Handshake complete with:', peerId);
    }
  }

  private handleHandshakeResponse(deviceInfo: DeviceInfo, peerId: string): void {
    console.log('Received handshake response from:', peerId, deviceInfo);

    // Store peer's device info
    this.peerDeviceInfo.set(peerId, deviceInfo);

    // Emit handshake complete
    this.emit('handshake-complete', { peerId, deviceInfo });
    console.log('Handshake complete with:', peerId);
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

      // Create WebRTC data connection
      const conn = this.peer.connect(targetPeerId, {
        reliable: true, // Ordered, reliable delivery
        serialization: 'binary', // Binary data for files
      });

      return new Promise((resolve) => {
        let timeout = setTimeout(() => {
          toast.dismiss('connecting');
          toast.error('Connection timeout');
          this.connectionStatus = 'failed';
          resolve(false);
        }, 15000);

        conn.on('open', () => {
          clearTimeout(timeout);
          toast.dismiss('connecting');

          console.log('Connection opened, initiating handshake...');

          this.connections.set(targetPeerId, conn);
          this.setupConnectionHandlers(conn, targetPeerId);

          // Send handshake to verify bidirectional communication
          this.sendHandshake(conn, targetPeerId);

          // Wait for handshake response (timeout after 5 seconds)
          const handshakeTimeout = setTimeout(() => {
            toast.error('Handshake timeout - connection may be unstable');
            // We don't fail hard, but warn user
          }, 5000);

          // Listen for handshake response to confirm full connection
          const handshakeHandler = (data: any) => {
            if (data.peerId === targetPeerId) {
              clearTimeout(handshakeTimeout);
              const deviceInfo = this.peerDeviceInfo.get(targetPeerId);
              const peerName = deviceInfo ? deviceInfo.deviceName : targetPeerId.substring(0, 8);

              toast.success(`Connected to ${peerName}`);
              playSound('success');

              this.connectionStatus = 'connected';
              this.emit('connection', {
                peerId: targetPeerId,
                deviceInfo
              });
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
      toast.error('Failed to connect to peer');
      this.connectionStatus = 'failed';
      return false;
    }
  }

  public acceptConnection(peerId: string): void {
    const conn = this.pendingConnections.get(peerId);

    if (!conn) {
      console.error('No pending connection found for:', peerId);
      return;
    }

    console.log('Accepting connection from:', peerId);

    // Remove from pending
    this.pendingConnections.delete(peerId);

    // Move to active connections
    this.connections.set(peerId, conn);

    // Set up data handlers
    this.setupConnectionHandlers(conn, peerId);

    // Send handshake to initiate device info exchange
    this.sendHandshake(conn, peerId);

    toast.loading(`Accepting connection...`, { id: 'accepting' });

    // Wait for handshake to complete
    const handshakeHandler = (data: any) => {
      if (data.peerId === peerId) {
        toast.dismiss('accepting');
        const deviceInfo = this.peerDeviceInfo.get(peerId);
        const peerName = deviceInfo ? deviceInfo.deviceName : peerId.substring(0, 8);

        toast.success(`Connected to ${peerName}`);
        playSound('success');

        this.emit('connection', {
          peerId,
          deviceInfo
        });
        this.off('handshake-complete', handshakeHandler);
      }
    };

    this.on('handshake-complete', handshakeHandler);

    // Fallback if handshake fails (assume connected but warn)
    setTimeout(() => {
      if (!this.peerDeviceInfo.has(peerId)) {
        toast.dismiss('accepting');
        // If we haven't received handshake but connection is open, still mark connected
        if (conn.open) {
          toast.success(`Connected to ${peerId.substring(0, 8)}`);
          this.emit('connection', { peerId });
        }
      }
    }, 5000);
  }

  public rejectConnection(peerId: string): void {
    const conn = this.pendingConnections.get(peerId);
    if (conn) {
      conn.close();
      this.pendingConnections.delete(peerId);
      this.emit('connection-reject', { peerId });
    }
  }

  public disconnectPeer(peerId: string): void {
    const conn = this.connections.get(peerId);
    if (conn) {
      conn.close();
      this.connections.delete(peerId);
      this.emit('peer-disconnected', { peerId });
      toast.success('Disconnected');
    }
  }

  private setupConnectionHandlers(conn: DataConnection, peerId: string): void {
    conn.on('data', (data) => {
      // Need to wrap in try-catch as data handling might fail
      try {
        this.handleIncomingData(data, peerId);
      } catch (e) {
        console.error("Error handling incoming data:", e);
      }
    });

    conn.on('close', () => {
      console.log('Connection closed:', peerId);
      this.connections.delete(peerId);
      this.peerDeviceInfo.delete(peerId);
      this.emit('peer-disconnected', { peerId });
      toast.error(`Peer ${peerId.substring(0, 8)} disconnected`);
    });

    conn.on('error', (error) => {
      console.error('Connection error:', error);
      this.emit('error', { error, peerId });
    });
  }


  // File Transfer Methods - SECURE implementation with Web Worker & Streams
  // File Transfer Methods - SECURE implementation with Web Worker & Streams
  public async sendFile(targetPeerId: string, file: File): Promise<void> {
    const conn = this.connections.get(targetPeerId);

    if (!conn || !conn.open) {
      toast.error('Not connected to peer');
      return;
    }

    try {
      // 1. Generate unique key/IV for this file transfer
      toast.loading('Preparing encryption...', { id: 'encrypting' });
      const cryptoKey = await Encryption.generateKey();
      const keyStr = await Encryption.exportKey(cryptoKey);
      const transferId = nanoid();

      toast.dismiss('encrypting');

      // 2. Initialize Transfer UI
      const transfer: FileTransfer = {
        id: transferId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
      };
      this.emit('file-outgoing', transfer);

      // 3. Send Metadata (Start Signal) - Send KEY only, IV will be per-chunk
      conn.send({
        type: 'file-start',
        payload: {
          id: transferId,
          name: file.name,
          size: file.size,
          type: file.type,
          key: keyStr,
          // No base IV needed if we send per-chunk
        },
      });

      toast.loading(`Sending ${file.name}...`, { id: transferId });

      // 4. Initialize Worker
      const worker = new Worker(new URL('../workers/encryption.worker.ts', import.meta.url), { type: 'module' });

      let offset = 0;
      const startTime = Date.now();
      const stream = file.stream();
      const reader = stream.getReader();

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

      // 5. Stream & Encrypt & Send Loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const currentConn = conn as any;
        while (currentConn.bufferedAmount > 1024 * 1024) {
          await new Promise(r => setTimeout(r, 10));
        }

        // Generate unique IV for this chunk
        const chunkIv = window.crypto.getRandomValues(new Uint8Array(12));

        // Encrypt in worker
        const encryptedChunk = await encryptChunk(value.buffer, cryptoKey, chunkIv);

        // Send chunk + its IV
        conn.send({
          type: 'file-chunk',
          payload: {
            id: transferId,
            chunk: encryptedChunk,
            iv: btoa(String.fromCharCode(...chunkIv)), // Send IV as string
            offset,
            totalSize: file.size,
          },
        });

        offset += value.length;
        // Use offset for progress (approximate, since encrypted size is slightly larger due to tags)
        const progress = Math.round((offset / file.size) * 100);

        // Calculate Speed & ETA
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        const speed = offset / elapsed; // bytes per second
        const remainingBytes = file.size - offset;
        const eta = speed > 0 ? remainingBytes / speed : 0;

        this.emit('file-progress', {
          id: transfer.id,
          progress,
          speed,
          eta,
          status: 'encrypting'
        });
      }

      worker.terminate();

      // 6. Finish
      conn.send({
        type: 'file-complete',
        payload: { id: transferId },
      });

      toast.dismiss(transferId);
      toast.success('File sent successfully!');
      playSound('success');

      transfer.status = 'completed';
      transfer.progress = 100;
      this.emit('file-sent', transfer);

    } catch (error) {
      console.error('File send error:', error);
      toast.dismiss('encrypting');
      toast.error('Failed to send file');
      this.emit('error', { error });
    }
  }

  private handleIncomingData(data: any, peerId: string): void {
    if (!data || typeof data !== 'object' || !data.type) {
      return;
    }

    const message: Message = data;

    switch (message.type) {
      case 'handshake':
        this.handleHandshake(message.payload, peerId);
        break;
      case 'handshake-response':
        this.handleHandshakeResponse(message.payload, peerId);
        break;
      case 'file-start':
        this.handleFileStart(message.payload);
        break;
      case 'file-chunk':
        this.handleFileChunk(message.payload);
        break;
      case 'file-complete':
        this.handleFileComplete(message.payload);
        break;
      case 'text-message':
        this.emit('message', { peerId, text: message.payload });
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private async handleFileStart(metadata: any): Promise<void> {
    // metadata: { id, name, size, type, key, iv } (iv is ignored or used as salt if complex)

    try {
      const cryptoKey = await Encryption.importKey(metadata.key);

      const transfer: FileTransfer = {
        id: metadata.id,
        name: metadata.name,
        size: metadata.size,
        type: metadata.type,
        progress: 0,
        status: 'pending',
      };

      // Store for tracking chunks AND keys
      chunks: [],
        receivedSize: 0,
          startTime: Date.now(), // Track start time
            cryptoKey, // Store the imported key object for fast chunk decryption
      });

    toast.loading(`Receiving ${metadata.name}...`, { id: metadata.id });
    toast.loading(`Receiving ${metadata.name}...`, { id: metadata.id });
    this.emit('file-incoming', transfer);
  } catch(e) {
    console.error("Failed to start file transfer:", e);
  }
}

  private async handleFileChunk(data: any): Promise < void> {
  // data: { id, chunk, iv, offset, totalSize }
  const transfer = this.incomingTransfers.get(data.id);
  if(!transfer || !transfer.cryptoKey) return;

try {
  // Decrypt immediately
  const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
  const decryptedChunk = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    transfer.cryptoKey,
    data.chunk
  );

  transfer.chunks.push({
    data: decryptedChunk,
    offset: data.offset,
  });

  const progress = Math.round(((data.offset + data.chunk.byteLength) / data.totalSize) * 100);

  // Update received size
  transfer.receivedSize = data.offset + data.chunk.byteLength;

  // Calculate Speed & ETA
  const elapsed = (Date.now() - transfer.startTime) / 1000;
  const speed = transfer.receivedSize / elapsed;
  const remainingBytes = data.totalSize - transfer.receivedSize;
  const eta = speed > 0 ? remainingBytes / speed : 0;

  this.emit('file-progress', {
    id: transfer.id,
    progress,
    speed,
    eta,
    status: 'downloading',
  });
} catch (e) {
  console.error("Chunk decryption failed", e);
  // Could request retry here
}
  }

  private async handleFileComplete(data: any): Promise < void> {
  const transfer = this.incomingTransfers.get(data.id);
  if(!transfer) return;

  try {
    toast.loading(`Finalizing ${transfer.name}...`, { id: data.id });

    // Reassemble already-decrypted chunks
    transfer.chunks.sort((a: any, b: any) => a.offset - b.offset);

    const totalSize = transfer.chunks.reduce((acc: number, chunk: any) => acc + chunk.data.byteLength, 0);
    const combined = new Uint8Array(totalSize);
    let offset = 0;

    for(const chunk of transfer.chunks) {
  combined.set(new Uint8Array(chunk.data), offset);
  offset += chunk.data.byteLength;
}

// Create download directly
const blob = new Blob([combined.buffer], { type: transfer.type });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = transfer.name;
a.click();

URL.revokeObjectURL(url);

// Clean up
this.incomingTransfers.delete(data.id);

toast.dismiss(data.transferId);
toast.dismiss(data.id);

toast.success('File received!');
playSound('success');

const fileTransfer: FileTransfer = {
  id: data.id,
  name: transfer.name,
  size: transfer.size,
  type: transfer.type,
  progress: 100,
  status: 'completed',
};

this.emit('file-received', fileTransfer);

    } catch (error) {
  console.error('Finalization error:', error);
  toast.dismiss(data.id);
  toast.error('Failed to save file');
}
  }

  public sendTextMessage(targetPeerId: string, text: string): void {
  const conn = this.connections.get(targetPeerId);
  if(conn) {
    conn.send({
      type: 'text-message',
      payload: text,
    });
  }
}

  // Event handling
  public on(event: string, handler: Function): void {
  if(!this.eventHandlers.has(event)) {
  this.eventHandlers.set(event, new Set());
}
this.eventHandlers.get(event)?.add(handler);
  }

  public off(event: string, handler: Function): void {
  this.eventHandlers.get(event)?.delete(handler);
}

  private emit(event: string, data: any): void {
  this.eventHandlers.get(event)?.forEach((handler) => handler(data));
}
}

