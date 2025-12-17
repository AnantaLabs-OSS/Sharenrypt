export interface LicenseValidationResult {
    valid: boolean;
    type: 'free' | 'pro' | 'enterprise';
    error?: string;
    description?: string;
}

// Declare the global function function exposed by Go
declare global {
    interface Window {
        Go: any;
        validateLicense: (key: string) => Promise<any>;

        // Peer API exposed by Go
        initPeer: () => { success: boolean; error?: string };
        setPeerCallbacks: (callbacks: {
            onOpen: (id: string) => void;
            onConnection: (info: { peer: string }) => void;
            onConnectionOpened: (peerId: string) => void;
            onIdentity: (peerId: string, username: string) => void;
            onFileIncoming: (peerId: string, meta: any) => void;
            onFileChunk: (fileId: string, chunkData: Uint8Array, progress: number) => void;
            onFileProgress: (fileId: string, progress: number) => void;
            onData: (peerId: string, data: any) => void;
            onDisconnected: (peerId: string) => void;
        }) => void;

        // Helper methods exposed by Go and used by Bridge
        connect: (peerId: string) => void;
        send: (peerId: string, data: any) => void;
        startSend: (fileId: string, peerId: string, size: number) => void;
        setUsername: (name: string) => void;

        // Helpers exposed by JS for Go to call
        readChunk: (fileId: string, offset: number, size: number) => Promise<Uint8Array>;
    }
}

export const WasmService = {
    validateLicense: async (key: string): Promise<LicenseValidationResult> => {
        if (!window.validateLicense) {
            console.warn('Wasm validateLicense not ready, using fallback');
            return { valid: false, type: 'free', error: 'Wasm module not loaded' };
        }

        try {
            return window.validateLicense(key);
        } catch (err) {
            console.error('Wasm validation error:', err);
            return { valid: false, type: 'free', error: 'Validation crashed' };
        }
    },

    // Peer Interactions
    initPeer: () => {
        if (window.Go && window.initPeer) {
            return window.initPeer();
        }
        return { success: false, error: 'Wasm not ready' };
    },

    setCallbacks: (callbacks: any) => {
        if (window.Go && window.setPeerCallbacks) {
            window.setPeerCallbacks(callbacks);
        }
    },

    setUsername: (name: string) => {
        if (window.setUsername) {
            window.setUsername(name);
        }
    },

    connect: (peerId: string) => {
        if (window.Go && window.connect) {
            window.connect(peerId);
        }
    },

    send: (peerId: string, data: any) => {
        if (window.Go && window.send) {
            window.send(peerId, data);
        }
    },

    startSend: (fileId: string, peerId: string, size: number) => {
        if (window.Go && window.startSend) {
            window.startSend(fileId, peerId, size);
        }
    }
};
