import { AppComponent } from "../AppComponent";

export type EventType = 'beforemount' | 'initialized' | 'init' | 'mounted' | 'navigate' | 'unmounting' | 'unmounted' | 'loaded';

class ComponentEvent extends CustomEvent<AppComponent|undefined> {
    componentName?: string;

    constructor(type: EventType, app?: AppComponent) {
        super(`app-component-${type}`, {
            detail: app
        });

        this.componentName = app?.elementName;
    }
}

export class EventHelper {
    private listeners: Map<EventType, Function[]> = new Map();

    on(event: EventType, callback: Function, keep: boolean = false) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        if (keep) {
            (window as any).addEventListener(`app-component-${event}`, (e: CustomEvent) => {
                callback(...e.detail);
            });

            return;
        }

        this.listeners.get(event)?.push(callback);
    }

    emit(event: EventType, ...args: any[]) {
        // check if event is available
        if (this.listeners.has(event)) {
            this.listeners.get(event)?.forEach((callback) => {
                callback(...args);
            });
        }

        if (window) {
            const detail = args.length === 1 ? args[0] : args;

            if (detail instanceof AppComponent) {
                window.dispatchEvent(new ComponentEvent(event, detail));

                return;
            }

            window.dispatchEvent(new CustomEvent(`app-component-${event}`, { detail }));
        }
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
