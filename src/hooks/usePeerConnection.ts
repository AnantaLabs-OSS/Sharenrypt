import { useState, useEffect, useCallback, useRef } from 'react';
import { PeerService } from '../services/peerService';
import { FileTransfer, PeerConnection } from '../types';

// Create singleton instance
let peerServiceInstance: PeerService | null = null;

export const usePeerConnection = () => {
  const [peerId, setPeerId] = useState<string>('');
  const [username, setUsernameState] = useState<string>('');
  const [connections, setConnections] = useState<PeerConnection[]>([]);
  const [files, setFiles] = useState<FileTransfer[]>([]);
  const [pendingConnections, setPendingConnections] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [messages, setMessages] = useState<{ id: string; peerId: string; text: string; self?: boolean; time: number; status: 'sent' | 'delivered' | 'read' }[]>([]);

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
      // Initialize username
      const existingName = peerServiceInstance!.getUsername();
      if (existingName) {
        setUsernameState(existingName);
      }
    };

    updatePeerId();

    // Listen for ready event
    const handleReady = (data: { peerId: string }) => {
      setPeerId(data.peerId);
    };

    const handleConnection = (data: { peerId: string; deviceInfo?: { username?: string } }) => {
      setConnections(prev => {
        if (!prev.find(c => c.id === data.peerId)) {
          return [...prev, {
            id: data.peerId,
            connected: true,
            username: data.deviceInfo?.username
          }];
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

    const handleMessage = (data: { peerId: string; text: string; id: string }) => {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, {
          id: data.id,
          peerId: data.peerId,
          text: data.text,
          time: Date.now(),
          status: 'sent'
        }];
      });
    };

    const handleMessageRead = (data: { peerId: string; messageId: string }) => {
      setMessages(prev => prev.map(msg =>
        msg.id === data.messageId ? { ...msg, status: 'read' } : msg
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
    peerServiceInstance.on('message', handleMessage);
    peerServiceInstance.on('message-read', handleMessageRead);

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
        peerServiceInstance.off('message', handleMessage);
        peerServiceInstance.off('message-read', handleMessageRead);
      }
    };
  }, []);

  const connectToPeer = useCallback(async (targetPeerId: string) => {
    if (!peerServiceRef.current) return;

    setConnectionStatus('connecting');
    await peerServiceRef.current.connectToPeer(targetPeerId);
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

    await peerServiceRef.current.sendFile(targetPeerId, file);
  }, []);

  const resumeTransfer = useCallback((targetPeerId: string, file: File, lastOffset: number) => {
    if (!peerServiceRef.current) return;
    peerServiceRef.current.resumeTransfer(targetPeerId, file, lastOffset);
  }, []);

  const sendTextMessage = useCallback((text: string, targetPeerId: string) => {
    if (!peerServiceRef.current) return;
    const id = peerServiceRef.current.sendTextMessage(targetPeerId, text);
    if (id) {
      setMessages(prev => [...prev, {
        id,
        peerId: 'Me',
        text,
        self: true,
        time: Date.now(),
        status: 'sent'
      }]);
    }
  }, []);

  const markMessageAsRead = useCallback((targetPeerId: string, messageId: string) => {
    if (peerServiceRef.current) {
      peerServiceRef.current.sendReadReceipt(targetPeerId, messageId);

      // Mark locally as read so we don't send receipt again
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
    }
  }, []);

  const retryConnection = useCallback((targetPeerId: string) => {
    setConnectionStatus('idle');
    if (peerServiceRef.current) peerServiceRef.current.connectToPeer(targetPeerId);
  }, []);

  const setUsername = useCallback((name: string) => {
    if (peerServiceRef.current) {
      peerServiceRef.current.setUsername(name);
      setUsernameState(name);
    }
  }, []);

  return {
    peerId,
    username,
    connections,
    files,
    messages,
    pendingConnections,
    connectionStatus,
    connectToPeer: (id: string) => { if (peerServiceRef.current) peerServiceRef.current.connectToPeer(id); },
    sendFile,
    resumeTransfer,
    sendTextMessage,
    disconnectPeer,
    acceptConnection,
    rejectConnection,
    retryConnection,
    setUsername,
    markMessageAsRead
  };
};