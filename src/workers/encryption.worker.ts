// Encryption Worker to offload heavy crypto operations from the main thread

self.addEventListener('message', async (e: MessageEvent) => {
    const { type, payload } = e.data;

    try {
        if (type === 'encrypt') {
            const { chunk, key, iv } = payload;

            // Import key if sent as raw data, or use CryptoKey if transferrable
            // Note: CryptoKeys are structured-cloneable, so they can be passed directly

            const encrypted = await self.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                chunk
            );

            self.postMessage({
                type: 'encrypt-success',
                payload: { encrypted }
            });
        }
        else if (type === 'decrypt') {
            const { chunk, key, iv } = payload;

            const decrypted = await self.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                chunk
            );

            self.postMessage({
                type: 'decrypt-success',
                payload: { decrypted }
            });
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            payload: { error: error }
        });
    }
});
