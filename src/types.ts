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

export interface WakeLockSentinel {
  release(): Promise<void>;
  readonly released: boolean;
  readonly type: WakeLockType;
}

// Internal Protocol Types
export interface DeviceInfo {
  peerId: string;
  deviceName: string;
  username?: string;
  browser: string;
  timestamp: number;
}

export interface SignalingMessage {
  type: string;
  payload: any;
}

export interface FileStartPayload {
  id: string;
  name: string;
  size: number;
  type: string;
  key: string; // CryptoKey exported as string
  offset: number;
}

export interface FileChunkPayload {
  id: string;
  chunk: ArrayBuffer;
  iv: string; // Base64
  offset: number;
  totalSize: number;
}
