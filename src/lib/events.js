class AppComponentBeforemount extends Event {
    constructor(componentName) {
        super('app-component-beforemount');

        this.componentName = componentName;
    }
}
class AppComponentInitialized extends Event {
    constructor(componentName) {
        super('app-component-initialized');

        this.componentName = componentName;
    }
}
class AppComponentInit extends Event {
    constructor(componentName) {
        super('app-component-init');

        this.componentName = componentName;
    }
}
class AppComponentMounted extends Event {
    constructor(componentName) {
        super('app-component-mounted');

        this.componentName = componentName;
    }
}

export class EventDispatcher {
    constructor() {
        // required when used in nuxt context
        if (!window) {
            return {};
        }

        if (EventDispatcher._instance) {
            return EventDispatcher._instance;
        }

        EventDispatcher._instance = this;
    }

    static dispatch(eventName, componentName) {
        const instance = new EventDispatcher();

        instance._dispatch(eventName, componentName);
    }

    _dispatch(eventName, componentName) {
        let event;
        if (eventName === 'beforemount') {
            event = new AppComponentBeforemount(componentName);
        }

        if (eventName === 'initialized') {
            event = new AppComponentInitialized(componentName);
        }

        if (eventName === 'init') {
            event = new AppComponentInit(componentName);
        }

        if (eventName === 'mounted') {
            event = new AppComponentMounted(componentName);
        }

        window.dispatchEvent(event);
    }
}
