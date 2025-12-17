import { EventEmitter } from '../utils/EventEmitter';
import { ConnectionManager } from './peer/ConnectionManager';
import { TransferManager } from './peer/TransferManager';

export class PeerService extends EventEmitter {
  private connectionManager: ConnectionManager;
  private transferManager: TransferManager;

  constructor() {
    super();
    this.connectionManager = new ConnectionManager();
    this.transferManager = new TransferManager(this.connectionManager);

    this.setupDelegation();
  }

  private setupDelegation(): void {
    // Forward Connection Events
    this.connectionManager.on('ready', (data) => this.emit('ready', data));
    this.connectionManager.on('connection', (data) => this.emit('connection', data));
    this.connectionManager.on('disconnection', (data) => this.emit('disconnection', data));
    this.connectionManager.on('connection-request', (data) => this.emit('connection-request', data));
    this.connectionManager.on('error', (data) => this.emit('error', data));

    // Forward Data/Transfer Events
    this.transferManager.on('file-outgoing', (data) => this.emit('file-outgoing', data));
    this.transferManager.on('file-progress', (data) => this.emit('file-progress', data));
    this.transferManager.on('file-incoming', (data) => this.emit('file-incoming', data));
    this.transferManager.on('file-received', (data) => this.emit('file-received', data));
    this.transferManager.on('file-sent', (data) => this.emit('file-sent', data));
    this.transferManager.on('message', (data) => this.emit('message', data));
    this.transferManager.on('message', (data) => this.emit('message', data));
    this.transferManager.on('message-read', (data) => this.emit('message-read', data));
    this.transferManager.on('typing-start', (data) => this.emit('typing-start', data));
    this.transferManager.on('typing-end', (data) => this.emit('typing-end', data));

    // Internal routing: Pass data from Connection to Transfer Manager
    this.connectionManager.on('data', ({ peerId, data }) => {
      this.transferManager.handleIncomingData(data, peerId);
    });
  }

  // --- API facade ---

  public getPeerId(): string {
    return this.connectionManager.getPeerId();
  }

  public setUsername(name: string): void {
    this.connectionManager.setUsername(name);
  }

  public getUsername(): string {
    return this.connectionManager.getUsername();
  }

  public connectToPeer(targetPeerId: string): Promise<boolean> {
    return this.connectionManager.connectToPeer(targetPeerId);
  }

  public acceptConnection(peerId: string): void {
    this.connectionManager.acceptConnection(peerId);
  }

  public rejectConnection(peerId: string): void {
    this.connectionManager.rejectConnection(peerId);
  }

  public disconnectPeer(peerId: string): void {
    this.connectionManager.disconnectPeer(peerId);
  }

  public sendFile(targetPeerId: string, file: File, startingOffset: number = 0): Promise<void> {
    return this.transferManager.sendFile(targetPeerId, file, startingOffset);
  }

  public sendZip(targetPeerId: string, files: File[]): Promise<void> {
    return this.transferManager.sendZip(targetPeerId, files);
  }

  public resumeTransfer(peerId: string, file: File, lastOffset: number): void {
    this.transferManager.resumeTransfer(peerId, file, lastOffset);
  }

  public sendTextMessage(targetPeerId: string, text: string): string | null {
    return this.transferManager.sendTextMessage(targetPeerId, text);
  }

  public sendTypingStatus(targetPeerId: string, isTyping: boolean): void {
    this.transferManager.sendTypingStatus(targetPeerId, isTyping);
  }

  public sendReadReceipt(targetPeerId: string, messageId: string): void {
    this.transferManager.sendReadReceipt(targetPeerId, messageId);
  }

  public getConnections() {
    return this.connectionManager.getConnections();
  }
}
