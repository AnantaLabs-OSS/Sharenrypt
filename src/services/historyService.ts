export interface HistoryItem {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    peerId: string;
    direction: 'incoming' | 'outgoing';
    status: 'completed' | 'failed' | 'cancelled';
    timestamp: number;
}

const STORAGE_KEY = 'sharencrypt_history';
const MAX_ITEMS = 50;

export const HistoryService = {
    add: (item: Omit<HistoryItem, 'timestamp'>) => {
        try {
            const history = HistoryService.getAll();
            const newItem: HistoryItem = { ...item, timestamp: Date.now() };

            const updated = [newItem, ...history].slice(0, MAX_ITEMS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return newItem;
        } catch (e) {
            console.error('Failed to save history', e);
            return null;
        }
    },

    getAll: (): HistoryItem[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
