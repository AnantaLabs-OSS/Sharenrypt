export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  encryptionProgress?: number;
  status: 'pending' | 'transferring' | 'completed' | 'error' | 'downloading' | 'encrypting';
  speed?: number; // bytes per second
  eta?: number; // seconds remaining
}

export interface PeerConnection {
  id: string;
  connected: boolean;
}