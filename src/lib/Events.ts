import { AppComponent } from "../AppComponent";

type EventType = 'beforemount' | 'initialized' | 'init' | 'mounted';

class BaseComponentEvent extends Event {
    componentName: string;

    constructor(eventName: string, componentName: string) {
        super(eventName);

        this.componentName = componentName;
    }
};

class AppComponentBeforemount extends BaseComponentEvent {
    constructor(componentName: string) {
        super('app-component-beforemount', componentName);
    }
}
class AppComponentInitialized extends BaseComponentEvent {
    constructor(componentName: string) {
        super('app-component-initialized', componentName);
    }
}
class AppComponentInit extends BaseComponentEvent {
    constructor(componentName: string) {
        super('app-component-init', componentName);
    }
}
class AppComponentMounted extends BaseComponentEvent {
    constructor(componentName: string) {
        super('app-component-mounted', componentName);
    }
}

export class EventDispatcher {
    static _instance: EventDispatcher;

    constructor() {
        // required when used in nuxt context
        if (!window) {
            return {
                _dispatch: () => {},
            };
        }

        if (EventDispatcher._instance) {
            return EventDispatcher._instance;
        }

        EventDispatcher._instance = this;
    }

    static dispatch(eventType: EventType, component: AppComponent) {
        const instance = new EventDispatcher();

        instance._dispatch(eventType, component.name, component.eventbus);
    }

    _dispatch(eventType: EventType, componentName: string, eventbus) {
        let event: BaseComponentEvent | undefined = undefined;
        if (eventType === 'beforemount') {
            event = new AppComponentBeforemount(componentName);
        }

        if (eventType === 'initialized') {
            event = new AppComponentInitialized(componentName);
        }

        if (eventType === 'init') {
            event = new AppComponentInit(componentName);
        }

        if (eventType === 'mounted') {
            event = new AppComponentMounted(componentName);
        }

        if (!event) {
            return;
        }

        if (eventbus && eventbus.trigger) {
            eventbus.trigger(eventType, event);
            return;
        }

        window.dispatchEvent(event);
    }
}
