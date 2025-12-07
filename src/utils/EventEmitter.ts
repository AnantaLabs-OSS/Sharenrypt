type Listener = (...args: any[]) => void;

export class EventEmitter {
    private events: Map<string, Set<Listener>> = new Map();

    public on(event: string, listener: Listener): void {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event)!.add(listener);
    }

    public off(event: string, listener: Listener): void {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.delete(listener);
        }
    }

    public emit(event: string, ...args: any[]): void {
        const listeners = this.events.get(event);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (e) {
                    console.error(`Error in event handler for ${event}:`, e);
                }
            });
        }
    }
}
