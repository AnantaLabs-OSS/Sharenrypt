export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'encrypting' | 'transferring' | 'downloading' | 'completed' | 'error';
  // Stats
  startTime?: number;
  speed?: number; // bytes per second
  eta?: number; // estimated seconds remaining
}

// Queue support
export interface QueueItem {
  id: string;
  file: File;
  peerId: string;
  status: 'queued' | 'pending' | 'transferring' | 'completed' | 'failed' | 'paused';
  progress: number;
}

export interface PeerConnection {
  id: string;
  connected: boolean;
  latency?: number; // ms
}

export interface Message {
  type: string;
  payload: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
}