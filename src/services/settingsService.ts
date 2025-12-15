
const STORAGE_KEYS = {
    PEER_ID: 'sharencrypt_peer_id',
    ICE_SERVERS: 'sharencrypt_ice_servers',
    SIGNALING_SERVER: 'sharencrypt_signaling_server',
    THEME: 'sharencrypt_theme', // Future proofing
};

import { CustomIceServer, SignalingServerConfig } from '../types';

export const settingsService = {
    // --- Peer Identity ---
    getSavedPeerId(): string | null {
        return localStorage.getItem(STORAGE_KEYS.PEER_ID);
    },

    savePeerId(id: string): void {
        localStorage.setItem(STORAGE_KEYS.PEER_ID, id);
    },

    clearPeerId(): void {
        localStorage.removeItem(STORAGE_KEYS.PEER_ID);
    },

    // --- Network Settings ---
    getIceServers(): CustomIceServer[] {
        const stored = localStorage.getItem(STORAGE_KEYS.ICE_SERVERS);
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse stored ICE servers', e);
            return [];
        }
    },

    saveIceServers(servers: CustomIceServer[]): void {
        localStorage.setItem(STORAGE_KEYS.ICE_SERVERS, JSON.stringify(servers));
    },

    addIceServer(server: CustomIceServer): void {
        const servers = this.getIceServers();
        servers.push(server);
        this.saveIceServers(servers);
    },

    removeIceServer(index: number): void {
        const servers = this.getIceServers();
        if (index >= 0 && index < servers.length) {
            servers.splice(index, 1);
            this.saveIceServers(servers);
        }
    },

    // --- Signaling Server ---
    getSignalingServer(): SignalingServerConfig | null {
        const stored = localStorage.getItem(STORAGE_KEYS.SIGNALING_SERVER);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse signaling server config', e);
            return null;
        }
    },

    saveSignalingServer(config: SignalingServerConfig): void {
        localStorage.setItem(STORAGE_KEYS.SIGNALING_SERVER, JSON.stringify(config));
    },

    clearSignalingServer(): void {
        localStorage.removeItem(STORAGE_KEYS.SIGNALING_SERVER);
    }
};
