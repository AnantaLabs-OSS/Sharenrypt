import { QueueItem } from '../../types';
import { PeerService } from '../peerService'; // Circular dep to be resolved by DI or event emitter later, strict for now we use an interface or emit events

export class QueueManager {
    private queue: QueueItem[] = [];
    private isProcessing: boolean = false;
    private peerService: PeerService;

    constructor(peerService: PeerService) {
        this.peerService = peerService;
    }

    public getQueue(): QueueItem[] {
        return this.queue;
    }

    public addToQueue(item: QueueItem): void {
        if (this.queue.some(i => i.id === item.id)) return;
        this.queue.push(item);
        this.peerService.emitQueueUpdate(this.queue);
        this.processQueue();
    }

    public removeFromQueue(id: string): void {
        this.queue = this.queue.filter(i => i.id !== id);
        this.peerService.emitQueueUpdate(this.queue);
    }

    public clearCompleted(): void {
        this.queue = this.queue.filter(i => i.status !== 'completed');
        this.peerService.emitQueueUpdate(this.queue);
    }

    public updateItemProgress(id: string, progress: number): void {
        const item = this.queue.find(i => i.id === id);
        if (item) {
            item.progress = progress;
            this.peerService.emitQueueUpdate(this.queue);
        }
    }

    public updateItemStatus(id: string, status: QueueItem['status']): void {
        const item = this.queue.find(i => i.id === id);
        if (item) {
            item.status = status;
            this.peerService.emitQueueUpdate(this.queue);
        }
    }

    public async processQueue(): Promise<void> {
        if (this.isProcessing) return;

        const nextItem = this.queue.find(item => item.status === 'queued');
        if (!nextItem) return;

        this.isProcessing = true;
        this.updateItemStatus(nextItem.id, 'transferring');

        try {
            await this.peerService.sendFile(nextItem.peerId, nextItem.file);
            this.updateItemStatus(nextItem.id, 'completed');
            this.updateItemProgress(nextItem.id, 100);
        } catch (error) {
            console.error('Queue processing error:', error);
            this.updateItemStatus(nextItem.id, 'failed');
        } finally {
            this.isProcessing = false;
            this.processQueue();
        }
    }
}
