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