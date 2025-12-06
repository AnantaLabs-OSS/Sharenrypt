import { useState, useEffect, useCallback, useRef } from 'react';
import { PeerService } from '../services/peerService';
import { FileTransfer, PeerConnection } from '../types';

// Create singleton instance
let peerServiceInstance: PeerService | null = null;

export const usePeerConnection = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [connections, setConnections] = useState<PeerConnection[]>([]);
  const [files, setFiles] = useState<FileTransfer[]>([]);
  const [pendingConnections, setPendingConnections] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');

  const peerServiceRef = useRef<PeerService | null>(null);

  useEffect(() => {
    // Initialize PeerService once
    if (!peerServiceInstance) {
      peerServiceInstance = new PeerService();
    }

    peerServiceRef.current = peerServiceInstance;

    // Set peer ID once it's ready
    const updatePeerId = () => {
      const id = peerServiceInstance!.getPeerId();
      if (id) {
        setPeerId(id);
      }
    };

    updatePeerId();

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

    // Clean up event listeners on unmount
    return () => {
      if (peerServiceInstance) {
        peerServiceInstance.off('ready', handleReady);
        peerServiceInstance.off('connection', handleConnection);
        peerServiceInstance.off('disconnection', handleDisconnection);
        peerServiceInstance.off('connection-request', handleConnectionRequest);
        peerServiceInstance.off('file-incoming', handleFileIncoming);
        peerServiceInstance.off('file-outgoing', handleFileOutgoing);
        peerServiceInstance.off('file-progress', handleFileProgress);
        peerServiceInstance.off('file-received', handleFileReceived);
        peerServiceInstance.off('file-sent', handleFileSent);
      }
    };
  }, []);

  const connectToPeer = useCallback(async (targetPeerId: string) => {
    if (!peerServiceRef.current) return;

    setConnectionStatus('connecting');
    const success = await peerServiceRef.current.connectToPeer(targetPeerId);
    if (!success) {
      setConnectionStatus('failed');
    }
  }, []);

  const acceptConnection = useCallback((targetPeerId: string) => {
    if (!peerServiceRef.current) return;

    peerServiceRef.current.acceptConnection(targetPeerId);
    setPendingConnections(prev => prev.filter(id => id !== targetPeerId));
  }, []);

  const rejectConnection = useCallback((targetPeerId: string) => {
    if (!peerServiceRef.current) return;

    peerServiceRef.current.rejectConnection(targetPeerId);
    setPendingConnections(prev => prev.filter(id => id !== targetPeerId));
  }, []);

  const disconnectPeer = useCallback((targetPeerId: string) => {
    if (!peerServiceRef.current) return;

    peerServiceRef.current.disconnectPeer(targetPeerId);
  }, []);

  const sendFile = useCallback(async (file: File, targetPeerId: string) => {
    if (!peerServiceRef.current) return;

    await peerServiceRef.current.sendFile(file, targetPeerId);
  }, []);

  const retryConnection = useCallback((targetPeerId: string) => {
    setConnectionStatus('idle');
    connectToPeer(targetPeerId);
  }, [connectToPeer]);

  return {
    peerId,
    connections,
    files,
    pendingConnections,
    connectionStatus,
    connectToPeer,
    sendFile,
    disconnectPeer,
    acceptConnection,
    rejectConnection,
    retryConnection
  };
};