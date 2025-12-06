import { useState, useEffect, useCallback } from 'react';
import { peerService } from '../services/peerService';
import { FileTransfer, PeerConnection, QueueItem, ChatMessage } from '../types';
import { nanoid } from 'nanoid';

export const usePeerConnection = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [connections, setConnections] = useState<PeerConnection[]>([]);
  const [files, setFiles] = useState<FileTransfer[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [pendingConnections, setPendingConnections] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Use the singleton directly
  const peerServiceInstance = peerService;

  useEffect(() => {
    // Set peer ID if already ready
    const currentId = peerServiceInstance.getPeerId();
    if (currentId) {
      setPeerId(currentId);
    }

    // Listen for ready event
    const handleReady = (data: { peerId: string }) => {
      setPeerId(data.peerId);
    };

    const handleConnection = (data: { peerId: string }) => {
      setConnections(prev => {
        if (!prev.find(c => c.id === data.peerId)) {
          return [...prev, { id: data.peerId, connected: true }];
        }
        return prev;
      });
      setConnectionStatus('connected');
    };

    const handleDisconnection = (data: { peerId: string }) => {
      setConnections(prev => prev.filter(conn => conn.id !== data.peerId));
    };

    const handleConnectionRequest = (data: { peerId: string }) => {
      setPendingConnections(prev => {
        if (!prev.includes(data.peerId)) {
          return [...prev, data.peerId];
        }
        return prev;
      });
    };

    const handleFileIncoming = (data: FileTransfer) => {
      setFiles(prev => {
        if (!prev.find(f => f.id === data.id)) {
          return [...prev, data];
        }
        return prev;
      });
    };

    const handleFileOutgoing = (data: FileTransfer) => {
      setFiles(prev => {
        if (!prev.find(f => f.id === data.id)) {
          return [...prev, data];
        }
        return prev;
      });
    };

    const handleFileProgress = (data: Partial<FileTransfer>) => {
      setFiles(prev => prev.map(file =>
        file.id === data.id
          ? { ...file, ...data }
          : file
      ));
    };

    const handleFileReceived = (data: Partial<FileTransfer>) => {
      setFiles(prev => prev.map(file =>
        file.id === data.id
          ? { ...file, ...data }
          : file
      ));
    };

    const handleFileSent = (data: Partial<FileTransfer>) => {
      setFiles(prev => prev.map(file =>
        file.id === data.id
          ? { ...file, ...data }
          : file
      ));
    };

    const handleLatencyUpdate = (data: { peerId: string, latency: number }) => {
      setConnections(prev => prev.map(conn =>
        conn.id === data.peerId
          ? { ...conn, latency: data.latency }
          : conn
      ));
    };

    const handleQueueUpdated = (data: { queue: QueueItem[] }) => {
      setQueue([...data.queue]);
    };

    const handleMessage = (data: { peerId: string, text: string }) => {
      const message: ChatMessage = {
        id: nanoid(),
        senderId: data.peerId,
        text: data.text,
        timestamp: Date.now(),
        isSelf: false
      };
      setChatHistory(prev => [...prev, message]);
    };

    // Register event listeners
    peerServiceInstance.on('ready', handleReady);
    peerServiceInstance.on('connection', handleConnection);
    peerServiceInstance.on('disconnection', handleDisconnection);
    peerServiceInstance.on('connection-request', handleConnectionRequest);
    peerServiceInstance.on('file-incoming', handleFileIncoming);
    peerServiceInstance.on('file-outgoing', handleFileOutgoing);
    peerServiceInstance.on('file-progress', handleFileProgress);
    peerServiceInstance.on('file-received', handleFileReceived);
    peerServiceInstance.on('file-sent', handleFileSent);
    peerServiceInstance.on('latency-update', handleLatencyUpdate);
    peerServiceInstance.on('queue-updated', handleQueueUpdated);
    peerServiceInstance.on('message', handleMessage);

    // Initial queue state
    setQueue(peerServiceInstance.getQueue());

    // Clean up event listeners on unmount
    return () => {
      peerServiceInstance.off('ready', handleReady);
      peerServiceInstance.off('connection', handleConnection);
      peerServiceInstance.off('disconnection', handleDisconnection);
      peerServiceInstance.off('connection-request', handleConnectionRequest);
      peerServiceInstance.off('file-incoming', handleFileIncoming);
      peerServiceInstance.off('file-outgoing', handleFileOutgoing);
      peerServiceInstance.off('file-progress', handleFileProgress);
      peerServiceInstance.off('file-received', handleFileReceived);
      peerServiceInstance.off('file-sent', handleFileSent);
      peerServiceInstance.off('latency-update', handleLatencyUpdate);
      peerServiceInstance.off('queue-updated', handleQueueUpdated);
      peerServiceInstance.off('message', handleMessage);
    };

  }, []);

  const connectToPeer = useCallback(async (targetPeerId: string) => {
    setConnectionStatus('connecting');
    peerServiceInstance.connect(targetPeerId);
  }, []);

  const acceptConnection = useCallback((targetPeerId: string) => {
    peerServiceInstance.acceptConnection(targetPeerId);
    setPendingConnections(prev => prev.filter(id => id !== targetPeerId));
  }, []);

  const rejectConnection = useCallback((targetPeerId: string) => {
    peerServiceInstance.rejectConnection(targetPeerId);
    setPendingConnections(prev => prev.filter(id => id !== targetPeerId));
  }, []);

  const disconnectPeer = useCallback((targetPeerId: string) => {
    peerServiceInstance.disconnect(targetPeerId);
  }, []);

  const sendFile = useCallback(async (file: File, targetPeerId: string) => {
    await peerServiceInstance.sendFile(targetPeerId, file);
  }, []);

  const addToQueue = useCallback(async (targetPeerId: string, files: FileList | File[]) => {
    await peerServiceInstance.addToQueue(targetPeerId, files);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    peerServiceInstance.removeFromQueue(id);
  }, []);

  const clearCompleted = useCallback(() => {
    peerServiceInstance.clearCompleted();
  }, []);

  const retryConnection = useCallback((targetPeerId: string) => {
    setConnectionStatus('idle');
    connectToPeer(targetPeerId);
  }, [connectToPeer]);

  const sendMessage = useCallback((targetPeerId: string, text: string) => {
    peerServiceInstance.sendTextMessage(targetPeerId, text);

    // Add to local history
    const message: ChatMessage = {
      id: nanoid(),
      senderId: peerServiceInstance.getPeerId(),
      text,
      timestamp: Date.now(),
      isSelf: true
    };
    setChatHistory(prev => [...prev, message]);
  }, []);

  return {
    peerId,
    connections,
    files,
    queue,
    pendingConnections,
    connectionStatus,
    connectToPeer,
    sendFile,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    disconnectPeer,
    acceptConnection,
    rejectConnection,
    retryConnection,
    chatHistory,
    sendMessage
  };
};