import { downloadZip } from 'client-zip';

export class ZipService {
    /**
     * Creates a readable stream of a Zip file from a list of files.
     * Leverages client-zip for zero-overhead streaming.
     */
    public static createZipStream(files: File[]): Response {
        // client-zip allows passing File objects directly.
        // It uses .webkitRelativePath if transparent, or we can construct it manually.
        // Our fileUtils sets .webkitRelativePath, so this should work OOTB.

        // We return the Response object which contains the user-accessible ReadableStream
        return downloadZip(files);
    }

    public static async getZipSizePrediction(files: File[]): Promise<number> {
        // ZIP overhead is roughly 30-100 bytes per file + filename length
        // This is an estimation, as we don't know compression ratio (usually 0 for store)
        // client-zip typically stores (no compression) which is faster.
        const totalSize = files.reduce((acc, f) => acc + f.size, 0);
        const overhead = files.reduce((acc, f) => acc + 120 + f.name.length * 2, 0); // Rough header estimate
        return totalSize + overhead;
    }
}
