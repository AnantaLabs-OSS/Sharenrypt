/**
 * File Utility functions for handling directory scanning and recursion.
 */

// Define the Entry types for TypeScript since they aren't standard yet
interface FileSystemEntry {
    isFile: boolean;
    isDirectory: boolean;
    name: string;
    fullPath: string;
}

interface FileSystemFileEntry extends FileSystemEntry {
    file: (successCallback: (file: File) => void, errorCallback?: (error: DOMException) => void) => void;
}

interface FileSystemDirectoryEntry extends FileSystemEntry {
    createReader: () => FileSystemDirectoryReader;
}

interface FileSystemDirectoryReader {
    readEntries: (successCallback: (entries: FileSystemEntry[]) => void, errorCallback?: (error: DOMException) => void) => void;
}

export interface FileWithRelativePath extends File {
    webkitRelativePath: string
    // specific property used by client-zip to build paths
    input?: File
}

/**
 * Scans a list of DataTransferItems and returns a flat list of files.
 * If a directory is found, it recursively finds all files within it.
 */
export const getFilesFromDataTransfer = async (items: DataTransferItemList): Promise<File[]> => {
    const files: File[] = [];
    const queue: Promise<void>[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry?.() as FileSystemEntry | null;
            if (entry) {
                queue.push(scanEntry(entry, files));
            } else {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }
    }

    await Promise.all(queue);
    return files;
};

const scanEntry = async (entry: FileSystemEntry, files: File[], path: string = ''): Promise<void> => {
    if (entry.isFile) {
        return new Promise((resolve, reject) => {
            (entry as FileSystemFileEntry).file(
                (file) => {
                    // We need to patch the webkitRelativePath because it's read-only normally
                    // but client-zip might expect it or we use a custom property
                    const relativePath = path + file.name;

                    // Clone the file to add path information
                    // We can't directly modify file.webkitRelativePath
                    const fileWithPath = new File([file], file.name, {
                        type: file.type,
                        lastModified: file.lastModified,
                    });

                    // Define path property for client-zip (standard is unused, but we can overload)
                    Object.defineProperty(fileWithPath, 'webkitRelativePath', {
                        value: relativePath
                    });

                    files.push(fileWithPath);
                    resolve();
                },
                (err) => reject(err)
            );
        });
    } else if (entry.isDirectory) {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader();
        const newPath = path + entry.name + '/';

        // readEntries only returns up to 100 entries, so we must loop
        const readAllEntries = async (): Promise<void> => {
            const entries: FileSystemEntry[] = await new Promise((resolve, reject) => {
                dirReader.readEntries(resolve, reject);
            });

            if (entries.length > 0) {
                await Promise.all(entries.map(e => scanEntry(e, files, newPath)));
                await readAllEntries(); // Continue reading
            }
        };

        await readAllEntries();
    }
};
