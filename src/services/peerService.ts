import Peer from 'peerjs';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { QueueItem, Message } from '../types';
import { QueueManager } from './peer/QueueManager';
import { ConnectionManager, ConnectionEvents } from './peer/ConnectionManager';
import { FileHandler, FileHandlerEvents } from './peer/FileHandler';

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
].filter(s => s.urls);

export class PeerService implements ConnectionEvents, FileHandlerEvents {
  private peer: Peer | null = null;
  private peerId: string = '';
  private eventHandlers: Map<string, Set<Function>> = new Map();

  // Managers
  private queueManager: QueueManager;
  private connectionManager: ConnectionManager;
  private fileHandler: FileHandler;

  constructor() {
    // Managers instantiation
    // ConnectionManager needs 'this' as ConnectionEvents
    this.connectionManager = new ConnectionManager(this);
    // FileHandler needs 'this' as FileHandlerEvents and reference to ConnectionManager
    this.fileHandler = new FileHandler(this, this.connectionManager);
    // QueueManager needs 'this' to access queue stuff, but it calls addToQueue which is now delegated?
    // Wait, QueueManager calls peerService.sendFile. 
    this.queueManager = new QueueManager(this);

    this.initializePeer();
  }

  private initializePeer(): void {
    try {
      this.peerId = nanoid();

      this.peer = new Peer(this.peerId, {
        host: import.meta.env.VITE_PEER_HOST || '0.peerjs.com',
        port: Number(import.meta.env.VITE_PEER_PORT) || 443,
        path: import.meta.env.VITE_PEER_PATH || '/',
        secure: import.meta.env.VITE_PEER_SECURE !== 'false',
        config: {
          iceServers: ICE_SERVERS,
          iceCandidatePoolSize: 10,
        },
        debug: 1,
      });

      this.setupPeerEvents();
    } catch (error: any) {
      console.error('Failed to initialize PeerJS:', error);
      toast.error('Failed to connect to P2P network');
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
      this.connectionManager.addPending(conn);
      // connectionManager handles the emit
    });

    this.peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      this.emit('error', { error: err });
      if (err.type === 'peer-unavailable') {
        toast.error('Peer not found');
      } else if (err.type === 'network') {
        toast.error('Network error - check connection');
      }
    });

    this.peer.on('disconnected', () => {
      console.log('Disconnected from signaling server');
      this.emit('disconnected-server', {});
      // Auto-reconnect
      setTimeout(() => {
        if (this.peer && !this.peer.destroyed) {
          this.peer.reconnect();
        }
      }, 5000);
    });
  }

  public getPeerId(): string {
    return this.peerId;
  }

  // --- Connection Delegation ---

  public connect(targetPeerId: string): void {
    if (!this.peer || targetPeerId === this.peerId) return;

    if (this.connectionManager.has(targetPeerId)) {
      this.connectionManager.close(targetPeerId);
    }

    const conn = this.peer.connect(targetPeerId, { reliable: true });
    this.connectionManager.setupConnectionEvents(conn);
  }

  public acceptConnection(targetPeerId: string): void {
    this.connectionManager.accept(targetPeerId);
  }

  public rejectConnection(targetPeerId: string): void {
    this.connectionManager.reject(targetPeerId);
  }

  public disconnect(peerId: string): void {
    this.connectionManager.disconnect(peerId);
  }

  public getLatency(peerId: string): number | undefined {
    return this.connectionManager.getLatency(peerId);
  }

  // --- Incoming Data Routing ---

  public handleIncomingData(data: any, peerId: string): void {
    if (!data || typeof data !== 'object' || !data.type) return;
    const message: Message = data;

    switch (message.type) {
      // PROTCOL: Handshake & Ping -> ConnectionManager
      case 'handshake':
        this.connectionManager.handleHandshake(message.payload, peerId);
        break;
      case 'handshake-response':
        this.connectionManager.handleHandshakeResponse(message.payload, peerId);
        break;
      case 'ping':
        this.connectionManager.handlePing(message.payload, peerId);
        break;
      case 'pong':
        this.connectionManager.handlePong(message.payload, peerId);
        break;

      // PROTOCOL: File Transfer -> FileHandler
      case 'file-start':
        this.fileHandler.handleFileStart(message.payload);
        break;
      case 'file-chunk':
        this.fileHandler.handleFileChunk(message.payload);
        break;
      case 'file-complete':
        this.fileHandler.handleFileComplete(message.payload);
        break;
      case 'transfer-query':
        this.fileHandler.handleTransferQuery(message.payload, peerId);
        break;
      case 'transfer-status':
        this.fileHandler.handleTransferStatus(message.payload);
        break;

      // PROTOCOL: Chat
      case 'text-message':
        this.emit('message', { peerId, text: message.payload });
        break;

      default: console.warn('Unknown message type:', message.type);
    }
  }

  // --- File Delegation ---

  public async sendFile(targetPeerId: string, file: File): Promise<void> {
    return this.fileHandler.sendFile(targetPeerId, file);
  }

  public sendTextMessage(targetPeerId: string, text: string): void {
    const conn = this.connectionManager.getConnection(targetPeerId);
    if (conn && conn.open) {
      conn.send({ type: 'text-message', payload: text });
    }
  }

  // --- Queue Delegation ---

  public getQueue(): QueueItem[] {
    return this.queueManager.getQueue();
  }

  public async addToQueue(peerId: string, files: FileList | File[]): Promise<void> {
    Array.from(files).forEach(file => {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const id = `${safeName}-${file.size}`;
      this.queueManager.addToQueue({ id, file, peerId, status: 'queued', progress: 0 });
    });
    return Promise.resolve();
  }

  public removeFromQueue(id: string): void {
    this.queueManager.removeFromQueue(id);
  }

  public clearCompleted(): void {
    this.queueManager.clearCompleted();
  }

  public emitQueueUpdate(queue: QueueItem[]): void {
    this.emit('queue-updated', { queue });
  }

  // --- Event System ---

  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(handler);
  }

  public off(event: string, handler: Function): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  public emit(event: string, data: any): void {
    this.eventHandlers.get(event)?.forEach((handler) => handler(data));
  }
}

export const peerService = new PeerService();