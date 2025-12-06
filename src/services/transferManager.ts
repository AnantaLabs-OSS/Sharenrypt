import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SharencryptDB extends DBSchema {
    transfers: {
        key: string;
        value: {
            id: string;
            name: string;
            size: number;
            type: string;
            key: string; // Encryption key (exported string)
            iv: string;  // Initial IV
            totalChunks: number;
            lastUpdated: number;
        };
    };
    chunks: {
        key: string; // Compound key: transferId_chunkIndex or just use auto-increment with index? 
        // Better: transferId_chunkIndex
        value: {
            transferId: string;
            chunkIndex: number;
            data: ArrayBuffer; // Encrypted chunk
            iv: string; // Per-chunk IV
        };
        indexes: { 'by-transfer': string };
    };
}

class TransferManager {
    private dbPromise: Promise<IDBPDatabase<SharencryptDB>>;

    constructor() {
        this.dbPromise = openDB<SharencryptDB>('sharencrypt-db', 1, {
            upgrade(db) {
                // Store transfer metadata
                db.createObjectStore('transfers', { keyPath: 'id' });

                // Store chunks
                const chunkStore = db.createObjectStore('chunks', {
                    keyPath: ['transferId', 'chunkIndex']
                });
                chunkStore.createIndex('by-transfer', 'transferId');
            },
        });
    }

    async saveTransferMetadata(metadata: {
        id: string;
        name: string;
        size: number;
        type: string;
        key: string;
        iv: string;
        totalChunks?: number;
    }) {
        const db = await this.dbPromise;
        await db.put('transfers', {
            ...metadata,
            totalChunks: metadata.totalChunks || 0,
            lastUpdated: Date.now(),
        });
    }

    async saveChunk(transferId: string, chunkIndex: number, data: ArrayBuffer, iv: string) {
        const db = await this.dbPromise;
        await db.put('chunks', {
            transferId,
            chunkIndex,
            data,
            iv
        });

        // Update timestamp on transfer
        const tx = db.transaction('transfers', 'readwrite');
        const store = tx.objectStore('transfers');
        const transfer = await store.get(transferId);
        if (transfer) {
            transfer.lastUpdated = Date.now();
            await store.put(transfer);
        }
    }

    async getTransfer(transferId: string) {
        const db = await this.dbPromise;
        return await db.get('transfers', transferId);
    }

    async getChunks(transferId: string) {
        const db = await this.dbPromise;
        return await db.getAllFromIndex('chunks', 'by-transfer', transferId);
    }

    async deleteTransfer(transferId: string) {
        const db = await this.dbPromise;
        const tx = db.transaction(['transfers', 'chunks'], 'readwrite');

        // Delete chunks
        // Note: IDB doesn't support bulk delete by index easily, have to iterate or use ranges
        // For simplicity with 'idb', we can iterate keys or use a key range if the key was [transferId, index]
        // Since our key is [transferId, chunkIndex], we can use a KeyRange bound to just that transferId
        const range = IDBKeyRange.bound([transferId, 0], [transferId, Infinity]);

        // But 'delete' on object store by range is not standard in all browsers yet? 
        // Actually idb library exposes `delete` which takes a key.
        // We might need to select keys and loop.

        // Using index to get keys
        const chunkKeys = await tx.objectStore('chunks').index('by-transfer').getAllKeys(transferId);
        await Promise.all(chunkKeys.map(key => tx.objectStore('chunks').delete(key)));

        // Delete metadata
        await tx.objectStore('transfers').delete(transferId);

        await tx.done;
    }

    async getAllIncompleteTransfers() {
        const db = await this.dbPromise;
        return await db.getAll('transfers');
    }

    async getLastChunkOffset(transferId: string): Promise<number> {
        const db = await this.dbPromise;
        const tx = db.transaction('chunks', 'readonly');
        const index = tx.store.index('by-transfer');

        // We want the chunk with the highest index.
        // IDB indexes are sorted. We can open a cursor at the end.
        const cursor = await index.openCursor(IDBKeyRange.only(transferId), 'prev');

        if (cursor) {
            const chunk = cursor.value;
            // The next offset needed is this chunk's index + its length (or implicit explicit offset)
            // Our key is [transferId, chunkIndex]. 'chunkIndex' was used as 'offset' in PeerService.
            // So if chunkIndex is the BYTE offset, then we just need chunkIndex + chunk.data.byteLength
            return chunk.chunkIndex + chunk.data.byteLength;
        }

        return 0;
    }
}

export const transferManager = new TransferManager();
