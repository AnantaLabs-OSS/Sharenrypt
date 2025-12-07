export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  encryptionProgress?: number;
  status: 'pending' | 'transferring' | 'completed' | 'error' | 'downloading' | 'encrypting' | 'waiting' | 'sending';
  speed?: number; // bytes per second
  eta?: number; // seconds remaining
  // Streaming Support
  fileHandle?: any; // FileSystemFileHandle
  writable?: any; // FileSystemWritableFileStream
  peerId?: string;
}

export interface PeerConnection {
  id: string;
  username?: string;
  connected: boolean;
}