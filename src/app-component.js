import { createApp } from 'vue';
// import { AppBugsnag } from '@/helper/bugsnag';

export class AppComponent extends HTMLElement {

    constructor(name, component) {
        super();

        this.name = name;

        this.component = component;

        this.app = null;
    }

    /**
     * Init our app view, equal to mount
     */
    connectedCallback() {
        // create wrapper div
        const wrapper = document.createElement('div');
        wrapper.id = this.wrapperId;
        wrapper.textContent = 'Loading...';

        // add to element DOM
        this.appendChild(wrapper);

        this.mountApp();
    }

    /**
     * Mount our Course Builder Vue App
     */
    mountApp() {
        // check if we have views
        if (this.app) {
            this.app.mount(this.wrapper);
        }

        const { props, attrs } = this.getAttributes();

        this.app = createApp(this.component, props);

        // AppBugsnag.start();
        // AppBugsnag.vue(this.app);

        this.registerAppComponents(this.app);
        this.registerAppPlugins(this.app);

        this.app.mount(this.wrapper);
    }

    /**
     * Register components, that are not commonly used
     *
     * @param app
     */
    registerAppComponents(app) {
        // override to register more components
    }

    /**
     * Register components, that are not commonly used
     *
     * @param app
     */
     registerAppPlugins(app) {
        // override to register more plugins
    }

    getAttributes() {
        // TODO filter in attributes and custom values
        const props = {};
        const attrs = {};
        for(const attr of this.attributes) {
            props[attr.name] = attr.value;
        }

        return {
            props,
            attrs,
        };
    }

    get wrapperId() {
        return `${this.name}-app`;
    }

    /**
     * Helper to get the mounted wrapper element
     *
     * @return {Element}
     */
    get wrapper() {
        return document.querySelector(`#${this.wrapperId}`);
    }

}
