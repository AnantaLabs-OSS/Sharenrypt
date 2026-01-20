import { downloadZip } from 'client-zip';

self.addEventListener('message', async (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'create-zip') {
        try {
            const files = payload.files;

            // Calculate size (prediction)
            // We can re-use the logic from ZipService or just do it here
            // Header overhead estimate: 120 bytes + filename length * 2
            const totalSize = files.reduce((acc: number, f: File) => acc + f.size, 0);
            const overhead = files.reduce((acc: number, f: File) => acc + 120 + f.name.length * 2, 0);
            const predictedSize = totalSize + overhead;

            // Start the zip stream
            const response = downloadZip(files);
            const stream = response.body;

            if (!stream) {
                throw new Error("Failed to create zip stream");
            }

            // Transfer the stream back to main thread
            self.postMessage({
                type: 'zip-created',
                payload: {
                    stream: stream,
                    size: predictedSize
                }
            }, [stream]);

        } catch (error: any) {
            self.postMessage({
                type: 'error',
                payload: { error: error.message }
            });
        }
    }
});
