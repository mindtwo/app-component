export type EventType = 'beforemount' | 'initialized' | 'init' | 'mounted' | 'navigate' | 'unmounting' | 'unmounted';

export class EventHelper {
    private listeners: Map<EventType, Function[]> = new Map();

    on(event: EventType, callback: Function, keep: boolean = false) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        if (keep) {
            (window as any).addEventListener(event, (e: CustomEvent) => {
                callback(...e.detail);
            });

            return;
        }

        this.listeners.get(event)?.push(callback);
    }

    emit(event: EventType, ...args: any[]) {
        if (!this.listeners.has(event)) {
            return;
        }

        if (window) {
            window.dispatchEvent(new CustomEvent(event, { detail: args }));
        }

        this.listeners.get(event)?.forEach((callback) => {
            callback(...args);
        });
    }

    off(event: EventType, callback: Function) {
        if (!this.listeners.has(event)) {
            return;
        }

        const index = this.listeners.get(event)?.indexOf(callback);

        if (index !== -1 && index !== undefined) {
            this.listeners.get(event)?.splice(index, 1);
        }
    }

    removeAllListeners() {
        this.listeners.clear();
    }
}
